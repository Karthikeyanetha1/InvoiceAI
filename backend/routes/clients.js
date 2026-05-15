const express = require('express');
const auth = require('../middleware/auth');
const Client = require('../models/Client');
const Document = require('../models/Document');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { search, category, status, sort='-createdAt' } = req.query;
    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name:{$regex:search,$options:'i'} },
      { company:{$regex:search,$options:'i'} },
      { email:{$regex:search,$options:'i'} }
    ];
    const clients = await Client.find(filter).sort(sort);
    res.json({ clients });
  } catch { res.status(500).json({ error:'Fetch failed' }) }
});

router.get('/stats/overview', auth, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user._id });
    const total = clients.length;
    const active = clients.filter(c=>c.status==='active').length;
    const sorted = [...clients].sort((a,b)=>b.totalBilled-a.totalBilled);
    const topClient = sorted[0] || null;
    const totalBilled = clients.reduce((s,c)=>s+(c.totalBilled||0),0);
    res.json({ total, active, topClient, totalBilled });
  } catch { res.status(500).json({ error:'Stats failed' }) }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ _id:req.params.id, userId:req.user._id });
    if (!client) return res.status(404).json({ error:'Client not found' });
    const invoices = await Document.find({
      userId: req.user._id,
      'clientInfo.name': { $regex: client.name, $options:'i' }
    }).sort({ createdAt:-1 }).limit(20);
    res.json({ client, invoices });
  } catch { res.status(500).json({ error:'Fetch failed' }) }
});

router.post('/', auth, async (req, res) => {
  try {
    const exists = await Client.findOne({ userId:req.user._id, name:req.body.name });
    if (exists) return res.status(400).json({ error:'Client already exists' });
    const client = await Client.create({ ...req.body, userId:req.user._id });
    res.status(201).json({ client });
  } catch { res.status(500).json({ error:'Create failed' }) }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id:req.params.id, userId:req.user._id },
      req.body, { new:true }
    );
    if (!client) return res.status(404).json({ error:'Not found' });
    res.json({ client });
  } catch { res.status(500).json({ error:'Update failed' }) }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Client.findOneAndDelete({ _id:req.params.id, userId:req.user._id });
    res.json({ message:'Deleted' });
  } catch { res.status(500).json({ error:'Delete failed' }) }
});

router.post('/sync', auth, async (req, res) => {
  try {
    const docs = await Document.find({ userId:req.user._id });
    let created = 0;
    const seen = new Set();
    for (const doc of docs) {
      const name = doc.clientInfo?.name;
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      const exists = await Client.findOne({ userId:req.user._id, name:{$regex:`^${name}$`,$options:'i'} });
      if (!exists) {
        await Client.create({
          userId:req.user._id,
          name:doc.clientInfo.name,
          company:doc.clientInfo.company||'',
          email:doc.clientInfo.email||'',
          phone:doc.clientInfo.phone||'',
          address:doc.clientInfo.address||''
        });
        created++;
      }
    }
    const clients = await Client.find({ userId:req.user._id });
    for (const client of clients) {
      const cd = docs.filter(d=>d.clientInfo?.name?.toLowerCase()===client.name.toLowerCase());
      client.invoiceCount = cd.length;
      client.totalBilled = cd.reduce((s,d)=>s+(d.total||0),0);
      client.totalPaid = cd.filter(d=>d.status==='paid').reduce((s,d)=>s+(d.total||0),0);
      client.lastInvoiceDate = cd[0]?.createdAt||null;
      await client.save();
    }
    res.json({ message:`Synced! ${created} new client${created!==1?'s':''} added.`, created });
  } catch(err) { res.status(500).json({ error:'Sync failed' }) }
});

module.exports = router;
