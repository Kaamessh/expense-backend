// Load environment variables from .env if present
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
require('./passport-setup');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(express.json());
app.use(helmet());
// Configure CORS to allow multiple origins via comma-separated env
const defaultOrigins = [
  'http://localhost:3000',
  'https://expense-frontend-kaameshs-projects.vercel.app',
  'https://expense-frontend-gamma-sandy.vercel.app'
];
const rawOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || defaultOrigins.join(',');
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin)
    if (!origin) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Permit Vercel preview/prod domains for this project
    const isVercel = /\.vercel\.app$/i.test(origin);
    const isProjectDomain = /expense-frontend/i.test(origin);
    if (isVercel && isProjectDomain) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 204
}));
// Handle CORS preflight for all routes
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 204
}));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/stats', statsRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/expenses';
  try {
    // Ensure we use a consistent database regardless of URI default
    await mongoose.connect(uri, { autoIndex: true, dbName: process.env.MONGO_DB_NAME || 'expenses' });
    const maskedUri = uri.replace(/:\w+@/, ':***@');
    console.log(`MongoDB connected (dbName=${process.env.MONGO_DB_NAME || 'expenses'}, uri=${maskedUri})`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
})();
