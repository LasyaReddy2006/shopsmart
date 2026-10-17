// server.js — Entry point for the Express backend

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ─────────────────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the React frontend (running on port 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Health check — visit http://localhost:5000/api/health to confirm the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ShopSmart API is running' });
});

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ─── Start Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ShopSmart server running on http://localhost:${PORT}`);
});
