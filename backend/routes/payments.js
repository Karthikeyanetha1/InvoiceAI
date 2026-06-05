const express = require('express');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const router = express.Router();

router.post('/create-order/:docId', auth, async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_')) {
      return res.status(400).json({ error: 'Razorpay keys not configured' });
    }
    const Razorpay = require('razorpay');
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const doc = await Document.findOne({ _id: req.params.docId, userId: req.user._id });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status === 'paid') return res.status(400).json({ error: 'Already paid' });
    const order = await instance.orders.create({
      amount: Math.round((doc.total || 0) * 100),
      currency: 'INR',
      receipt: doc.documentNumber,
    });
    res.json({ order, key: process.env.RAZORPAY_KEY_ID, document: doc });
  } catch(err) { res.status(500).json({ error: err.message || 'Failed' }); }
});

router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, documentId } = req.body;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ error: 'Verification failed' });
    const doc = await Document.findByIdAndUpdate(documentId, { status: 'paid', paymentId: razorpay_payment_id, paidAt: new Date() }, { new: true });
    res.json({ success: true, document: doc });
  } catch(err) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
