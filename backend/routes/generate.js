const express = require('express');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const { generateDocumentFromPrompt, improveDocument } = require('../services/aiService');
const { generateInvoiceHTML } = require('../services/pdfService');
const router = express.Router();

router.post('/ai', auth, async (req, res) => {
  try {
    const { prompt, docType='invoice', currency } = req.body;
    if (!prompt) return res.status(400).json({ error:'Prompt is required' });
    const businessInfo = req.user.businessInfo||{};
    const userCurrency = currency||businessInfo.currency||'INR';
    const aiData = await generateDocumentFromPrompt(prompt, docType, businessInfo, userCurrency);
    const docNumber = aiData.documentNumber||`${docType.toUpperCase().slice(0,3)}-${Date.now()}`;
    const document = await Document.create({
      userId:req.user._id, type:docType,
      title:aiData.title||`${docType} Document`,
      prompt, documentNumber:docNumber,
      clientInfo:aiData.clientInfo, lineItems:aiData.lineItems,
      subtotal:aiData.subtotal, taxRate:aiData.taxRate,
      taxAmount:aiData.taxAmount, discount:aiData.discount||0,
      total:aiData.total, currency:aiData.currency||userCurrency,
      notes:aiData.notes, terms:aiData.terms,
      dueDate:aiData.dueDate?new Date(aiData.dueDate):null,
      aiGenerated:true
    });
    await req.user.updateOne({ $inc:{ usageCount:1 } });
    res.json({ document, message:'Document generated successfully' });
  } catch(err) {
    console.error('AI error:', err);
    res.status(500).json({ error:err.message||'AI generation failed' });
  }
});

router.post('/improve/:id', auth, async (req, res) => {
  try {
    const { feedback } = req.body;
    const document = await Document.findOne({ _id:req.params.id, userId:req.user._id });
    if (!document) return res.status(404).json({ error:'Not found' });
    const improved = await improveDocument(document.toObject(), feedback);
    Object.assign(document, {
      clientInfo:improved.clientInfo||document.clientInfo,
      lineItems:improved.lineItems||document.lineItems,
      subtotal:improved.subtotal, taxRate:improved.taxRate,
      taxAmount:improved.taxAmount, total:improved.total,
      notes:improved.notes, terms:improved.terms,
      discount:improved.discount||0
    });
    await document.save();
    res.json({ document });
  } catch(err) {
    res.status(500).json({ error:'Improvement failed: '+err.message });
  }
});

router.get('/pdf/:id', auth, async (req, res) => {
  try {
    const { template='modern' } = req.query;
    const document = await Document.findOne({ _id:req.params.id, userId:req.user._id });
    if (!document) return res.status(404).json({ error:'Not found' });
    const businessInfo = req.user.businessInfo||{};
    const html = generateInvoiceHTML(document.toObject(), businessInfo, template);
    res.setHeader('Content-Type','text/html');
    res.send(html);
  } catch(err) {
    res.status(500).json({ error:'Failed: '+err.message });
  }
});

module.exports = router;
