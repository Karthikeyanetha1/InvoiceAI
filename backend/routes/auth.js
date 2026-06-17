const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── Email transporter ──
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

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
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code'
            })
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
        res.json({
            token: generateToken(user._id),
            user: { id:user._id, name:user.name, email:user.email, plan:user.plan, businessInfo:user.businessInfo }
        })
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
            if (!isValidEmail(email)) return res.status(400).json({ error: 'Please use a valid email. Temporary or fake emails are not allowed.' })
            if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' })
            const user = await User.create({ name, email, password })

            // Welcome email
            try {
                const transporter = createTransporter()
                await transporter.sendMail({
                    from: `"InvoiceAI by CodeWithK" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Welcome to InvoiceAI! 🎉',
                    html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
              <div style="text-align:center;margin-bottom:24px">
                <div style="width:56px;height:56px;background:#16a34a;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;color:#fff;font-weight:800">₹</div>
                <h2 style="color:#111827;margin-top:12px;font-size:24px;font-weight:800">InvoiceAI</h2>
                <p style="color:#6b7280;font-size:13px">by CodeWithK</p>
              </div>
              <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0">
                <h3 style="color:#111827;margin-bottom:12px">Welcome, ${name}! 👋</h3>
                <p style="color:#6b7280;font-size:14px;line-height:1.7;margin-bottom:20px">
                  Your InvoiceAI account is ready. You can now generate professional AI-powered invoices, quotations, receipts and more in seconds!
                </p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px">
                  <div style="font-size:13px;color:#15803d;font-weight:600;margin-bottom:8px">✦ Free Plan Includes:</div>
                  <div style="font-size:13px;color:#374151;line-height:1.8">
                    ✅ 20 AI document generations/month<br>
                    ✅ Invoice, Quotation, Receipt, PO, Custom Forms<br>
                    ✅ 4 professional PDF templates<br>
                    ✅ Client management<br>
                    ✅ Revenue dashboard
                  </div>
                </div>
                <a href="${process.env.FRONTEND_URL}/generate" style="display:block;text-align:center;background:#16a34a;color:#fff;padding:13px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
                  Generate Your First Invoice →
                </a>
              </div>
              <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px">
                InvoiceAI by CodeWithK · Hyderabad, India
              </p>
            </div>
          `
                })
            } catch (emailErr) {
                console.log('Welcome email failed (non-critical):', emailErr.message)
            }

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
        const user = await User.findByIdAndUpdate(req.user._id, { businessInfo }, { new: true }).select('-password')
        res.json({ user })
    } catch { res.status(500).json({ error: 'Update failed' }) }
})

// ── Legacy business-info ──
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
        if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ error: 'Current password is incorrect' })
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
        const user = await User.findOne({ email })
        if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' })

        const resetToken = crypto.randomBytes(32).toString('hex')
        user.resetToken = resetToken
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
        await user.save()

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

        const transporter = createTransporter()
        await transporter.sendMail({
            from: `"InvoiceAI by CodeWithK" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your InvoiceAI Password',
            html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="width:56px;height:56px;background:#16a34a;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;color:#fff;font-weight:800">₹</div>
            <h2 style="color:#111827;margin-top:12px;font-size:22px;font-weight:800">InvoiceAI</h2>
          </div>
          <div style="background:#fff;border-radius:10px;padding:28px;border:1px solid #e2e8f0">
            <h3 style="color:#111827;margin-bottom:8px">Reset Your Password</h3>
            <p style="color:#6b7280;font-size:14px;line-height:1.7;margin-bottom:20px">
              Hi ${user.name},<br><br>
              We received a request to reset your InvoiceAI password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <a href="${resetURL}" style="display:block;text-align:center;background:#16a34a;color:#fff;padding:13px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:20px">
              Reset Password →
            </a>
            <p style="color:#9ca3af;font-size:12px;text-align:center">
              If you didn't request this, please ignore this email.<br>
              Your password will remain unchanged.
            </p>
          </div>
          <p style="text-align:center;font-size:11px;color:#d1d5db;margin-top:16px">
            InvoiceAI by CodeWithK · Hyderabad, India
          </p>
        </div>
      `
        })

        res.json({ message: 'Password reset link sent to your email!' })
    } catch (err) {
        console.error('Reset email error:', err)
        res.status(500).json({ error: 'Failed to send reset email' })
    }
})

// ── Reset password ──
router.post('/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword } = req.body
        if (!token || !email || !newPassword) return res.status(400).json({ error: 'Missing fields' })
        if (newPassword.length < 6) return res.status(400).json({ error: 'Min 6 characters' })

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() }
        })
        if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' })

        user.password = newPassword
        user.resetToken = undefined
        user.resetTokenExpiry = undefined
        await user.save()

        res.json({ message: 'Password reset successfully! You can now login.' })
    } catch { res.status(500).json({ error: 'Reset failed' }) }
})

module.exports = router;