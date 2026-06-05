const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Document = require('../models/Document');

router.get('/stats', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDocs = await Document.countDocuments();
    const paidDocs = await Document.countDocuments({ status: 'paid' });
    const revenue = await Document.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    const usersByPlan = await User.aggregate([{ $group: { _id: '$plan', count: { $sum: 1 } } }]);
    res.json({ totalUsers, totalDocs, paidDocs, totalRevenue: revenue[0]?.total || 0, recentUsers, usersByPlan });
  } catch(err) { res.status(500).json({ error: 'Stats failed' }); }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json({ users, total: users.length });
  } catch(err) { res.status(500).json({ error: 'Failed' }); }
});

router.put('/users/:id', auth, async (req, res) => {
  try {
    const { role, plan } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { ...(role && { role }), ...(plan && { plan }) }, { new: true }).select('-password');
    res.json({ user });
  } catch(err) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/users/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
