const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const generateRoutes = require('./routes/generate');
const clientRoutes   = require('./routes/clients');
const adminRoutes    = require('./routes/admin');
const paymentRoutes  = require('./routes/payments');

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://invoiceai-1.onrender.com',
        'https://invoiceai-yxr5.onrender.com',
        process.env.FRONTEND_URL
    ],
    credentials: true
}))
app.use(express.json({ limit: '10mb' }));

const limiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

app.use('/api/', limiter);
app.use('/api/generate', aiLimiter);

app.use('/api/auth',      authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/generate',  generateRoutes);
app.use('/api/clients',   clientRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/payments',  paymentRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));