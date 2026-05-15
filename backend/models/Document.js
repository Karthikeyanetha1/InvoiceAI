const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: String,
  quantity: Number,
  rate: Number,
  amount: Number
});

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['invoice', 'quotation', 'receipt', 'purchase_order', 'custom_form'], required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'cancelled'], default: 'draft' },
  prompt: String,
  documentNumber: String,
  clientInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    company: String
  },
  lineItems: [lineItemSchema],
  subtotal: Number,
  taxRate: { type: Number, default: 18 },
  taxAmount: Number,
  discount: { type: Number, default: 0 },
  total: Number,
  currency: { type: String, default: 'INR' },
  notes: String,
  terms: String,
  dueDate: Date,
  htmlContent: String,
  pdfUrl: String,
  aiGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

documentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
