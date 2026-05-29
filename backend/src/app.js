const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Base Routes
app.use('/api/auth', authRoutes);
app.use('/api/trip', tripRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'backend' });
});

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'API route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message || err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
