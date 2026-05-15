const express = require('express');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { type, status, page=1, limit=20 } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    const docs = await Document.find(filter).sort({ createdAt:-1 }).skip((page-1)*limit).limit(Number(limit));
    const total = await Document.countDocuments(filter);
    res.json({ documents:docs, total, page:Number(page), totalPages:Math.ceil(total/limit) });
  } catch { res.status(500).json({ error:'Fetch failed' }) }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id:req.params.id, userId:req.user._id });
    if (!doc) return res.status(404).json({ error:'Document not found' });
    res.json({ document:doc });
  } catch { res.status(500).json({ error:'Fetch failed' }) }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate({ _id:req.params.id, userId:req.user._id }, req.body, { new:true });
    if (!doc) return res.status(404).json({ error:'Not found' });
    res.json({ document:doc });
  } catch { res.status(500).json({ error:'Update failed' }) }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id:req.params.id, userId:req.user._id });
    if (!doc) return res.status(404).json({ error:'Not found' });
    res.json({ message:'Deleted' });
  } catch { res.status(500).json({ error:'Delete failed' }) }
});

router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const allDocs = await Document.find({ userId }).sort({ createdAt:1 });
    const invoiceDocs = allDocs.filter(d=>d.type==='invoice');
    const totalDocuments = allDocs.length;
    const totalRevenue = invoiceDocs.filter(d=>d.status==='paid').reduce((s,d)=>s+(d.total||0),0);
    const pendingRevenue = invoiceDocs.filter(d=>d.status==='sent'||d.status==='draft').reduce((s,d)=>s+(d.total||0),0);
    const invoiceCount = invoiceDocs.length;
    const paidCount = invoiceDocs.filter(d=>d.status==='paid').length;
    const overdueCount = invoiceDocs.filter(d=>(d.status==='sent'||d.status==='draft')&&d.dueDate&&new Date(d.dueDate)<now).length;
    const byStatus = ['draft','sent','paid','cancelled'].map(s=>({ _id:s, count:allDocs.filter(d=>d.status===s).length }));
    const byType = ['invoice','quotation','receipt','purchase_order','custom_form'].map(t=>({ _id:t, count:allDocs.filter(d=>d.type===t).length })).filter(t=>t.count>0);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyData = [];
    for (let i=5; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const end = new Date(now.getFullYear(), now.getMonth()-i+1, 0);
      const monthDocs = invoiceDocs.filter(doc=>{ const c=new Date(doc.createdAt); return c>=d&&c<=end; });
      monthlyData.push({
        month: monthNames[d.getMonth()],
        revenue: monthDocs.filter(d=>d.status==='paid').reduce((s,doc)=>s+(doc.total||0),0),
        invoices: monthDocs.length,
        pending: monthDocs.filter(d=>d.status==='sent'||d.status==='draft').reduce((s,doc)=>s+(doc.total||0),0)
      });
    }
    const clientMap = {};
    invoiceDocs.forEach(doc=>{ const name=doc.clientInfo?.name||'Unknown'; if(!clientMap[name]) clientMap[name]={name,total:0,count:0,company:doc.clientInfo?.company||''}; clientMap[name].total+=doc.total||0; clientMap[name].count+=1; });
    const topClients = Object.values(clientMap).sort((a,b)=>b.total-a.total).slice(0,5);
    const recentDocs = allDocs.slice(-5).reverse();
    res.json({ totalDocuments, totalRevenue, pendingRevenue, invoiceCount, paidCount, overdueCount, byStatus, byType, monthlyData, topClients, recentDocs, thisMonthRevenue:monthlyData[5]?.revenue||0, lastMonthRevenue:monthlyData[4]?.revenue||0 });
  } catch(err) { console.error(err); res.status(500).json({ error:'Stats failed' }) }
});

module.exports = router;
