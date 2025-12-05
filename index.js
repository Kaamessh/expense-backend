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
app.use(cors({ origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
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
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
})();
