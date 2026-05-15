const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
  usageCount: { type: Number, default: 0 },
  businessInfo: {
    companyName: String,
    address: String,
    phone: String,
    email: String,
    logo: String,
    taxId: String,
    currency: { type: String, default: 'INR' }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
