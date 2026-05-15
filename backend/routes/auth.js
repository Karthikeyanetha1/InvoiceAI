const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register',
  [body('name').trim().notEmpty(),body('email').isEmail(),body('password').isLength({min:6})],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });
      const user = await User.create({ name, email, password });
      res.status(201).json({ token: generateToken(user._id), user: { id:user._id, name:user.name, email:user.email, plan:user.plan } });
    } catch { res.status(500).json({ error: 'Server error' }) }
  }
);
router.post('/login',
  [body('email').isEmail(),body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ token: generateToken(user._id), user: { id:user._id, name:user.name, email:user.email, plan:user.plan, businessInfo:user.businessInfo } });
    } catch { res.status(500).json({ error: 'Server error' }) }
  }
);
router.get('/me', auth, (req, res) => res.json({ user: req.user }));
router.put('/business-info', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { businessInfo: req.body }, { new: true }).select('-password');
    res.json({ user });
  } catch { res.status(500).json({ error: 'Update failed' }) }
});
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ error: 'Current password is incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch { res.status(500).json({ error: 'Password change failed' }) }
});
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    await User.findOne({ email }); // check exists but don't reveal
    console.log(`Password reset requested for: ${email}`);
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch { res.status(500).json({ error: 'Failed' }) }
});
module.exports = router;
