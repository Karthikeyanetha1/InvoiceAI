const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Block fake/temp emails ──
const BLOCKED_DOMAINS = [
    'example.com','test.com','fake.com','tempmail.com','mailinator.com',
    'guerrillamail.com','yopmail.com','throwaway.email','temp-mail.org',
    'trashmail.com','sharklasers.com','guerrillamailblock.com','grr.la',
    'guerrillamail.info','spam4.me','dispostable.com','maildrop.cc',
    'spamgourmet.com','mytemp.email','fakeinbox.com','tempr.email',
    'discard.email','spamherelots.com','spoofmail.de','tempinbox.com',
    'getairmail.com','filzmail.com','throwam.com','tempemail.net'
]

const isValidEmail = (email) => {
    if (!email) return false
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!re.test(email)) return false
    const domain = email.split('@')[1]?.toLowerCase()
    if (!domain) return false
    if (BLOCKED_DOMAINS.includes(domain)) return false
    return true
}

// ── Google OAuth ──
router.get('/google/url', (req, res) => {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID
        const redirectUri = process.env.GOOGLE_REDIRECT_URI
        if (!clientId || !redirectUri) return res.status(500).json({ error: 'Google OAuth not configured' })
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline`
        res.json({ url })
    } catch { res.status(500).json({ error: 'Failed to generate Google URL' }) }
})

router.post('/google/callback', async (req, res) => {
    try {
        const { code } = req.body
        if (!code) return res.status(400).json({ error: 'No code provided' })
        const clientId = process.env.GOOGLE_CLIENT_ID
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET
        const redirectUri = process.env.GOOGLE_REDIRECT_URI

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ code, client_id:clientId, client_secret:clientSecret, redirect_uri:redirectUri, grant_type:'authorization_code' })
        })
        const tokenData = await tokenRes.json()
        if (tokenData.error) return res.status(400).json({ error: tokenData.error_description || 'Google auth failed' })

        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        })
        const googleUser = await userRes.json()
        if (!googleUser.email) return res.status(400).json({ error: 'Could not get email from Google' })

        let user = await User.findOne({ email: googleUser.email })
        if (!user) {
            user = await User.create({
                name: googleUser.name || googleUser.email.split('@')[0],
                email: googleUser.email,
                password: Math.random().toString(36).slice(-12) + '!A1',
                googleId: googleUser.sub,
                avatar: googleUser.picture
            })
        }
        res.json({ token: generateToken(user._id), user: { id:user._id, name:user.name, email:user.email, plan:user.plan, businessInfo:user.businessInfo } })
    } catch (err) { res.status(500).json({ error: 'Google authentication failed' }) }
})

// ── Register ──
router.post('/register',
    [body('name').trim().notEmpty(), body('email').isEmail(), body('password').isLength({ min:6 })],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Please fill all fields correctly' })
        try {
            const { name, email, password } = req.body

            // Block fake emails
            if (!isValidEmail(email)) {
                return res.status(400).json({ error: 'Please use a valid email address. Temporary or fake emails are not allowed.' })
            }

            if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' })
            const user = await User.create({ name, email, password })
            res.status(201).json({
                token: generateToken(user._id),
                user: { id:user._id, name:user.name, email:user.email, plan:user.plan }
            })
        } catch { res.status(500).json({ error: 'Server error' }) }
    }
)

// ── Login ──
router.post('/login',
    [body('email').isEmail(), body('password').notEmpty()],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid email or password' })
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ error: 'Invalid email or password' })
            }
            res.json({
                token: generateToken(user._id),
                user: { id:user._id, name:user.name, email:user.email, plan:user.plan, role:user.role, businessInfo:user.businessInfo, usageCount:user.usageCount }
            })
        } catch { res.status(500).json({ error: 'Server error' }) }
    }
)

// ── Get current user ──
router.get('/me', auth, (req, res) => res.json({ user: req.user }))

// ── Update profile ──
router.put('/profile', auth, async (req, res) => {
    try {
        const { businessInfo } = req.body
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { businessInfo },
            { new: true }
        ).select('-password')
        res.json({ user })
    } catch { res.status(500).json({ error: 'Update failed' }) }
})

// ── Legacy business-info route ──
router.put('/business-info', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { businessInfo: req.body }, { new: true }).select('-password')
        res.json({ user })
    } catch { res.status(500).json({ error: 'Update failed' }) }
})

// ── Change password ──
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const user = await User.findById(req.user._id)
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(400).json({ error: 'Current password is incorrect' })
        }
        if (newPassword.length < 6) return res.status(400).json({ error: 'Min 6 characters' })
        user.password = newPassword
        await user.save()
        res.json({ message: 'Password changed successfully' })
    } catch { res.status(500).json({ error: 'Password change failed' }) }
})

// ── Forgot password ──
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body
        await User.findOne({ email })
        console.log(`Password reset requested for: ${email}`)
        res.json({ message: 'If that email exists, a reset link was sent.' })
    } catch { res.status(500).json({ error: 'Failed' }) }
})

module.exports = router;