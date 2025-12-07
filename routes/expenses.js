const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Expense.find({ userId: req.userId }).sort({ date: -1 }).skip(skip).limit(limit),
    Expense.countDocuments({ userId: req.userId })
  ]);
  const pages = Math.ceil(total / limit) || 1;
  res.json({ items, page, pages, total });
});

router.post('/', auth, async (req, res) => {
  try {
    const { date, category, description, amount, currencyCode, currencySymbol } = req.body;
    if (!date || !category || amount == null) {
      return res.status(400).json({ error: 'Missing fields', details: { date, category, amount } });
    }

    // Normalize date: accept ISO, YYYY-MM-DD, DD-MM-YYYY, and common separators
    let parsedDate = null;
    if (date instanceof Date) {
      parsedDate = date;
    } else if (typeof date === 'string') {
      const s = date.trim();
      // Replace '/' with '-' for consistency
      const norm = s.replace(/\//g, '-');
      // Try DD-MM-YYYY -> YYYY-MM-DD
      const m = norm.match(/^([0-3]?\d)-([0-1]?\d)-(\d{4})$/);
      if (m) {
        const yyyyMmDd = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        parsedDate = new Date(yyyyMmDd);
      } else {
        parsedDate = new Date(norm);
      }
    }

    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY.' });
    }

    // Normalize amount to Number
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    if (!Number.isFinite(numAmount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const exp = await Expense.create({
      userId: req.userId,
      date: parsedDate,
      category,
      description,
      amount: numAmount,
      currencyCode: currencyCode || 'INR',
      currencySymbol: currencySymbol || '₹',
    });
    res.status(201).json(exp);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating expense', message: err.message });
  }
});

module.exports = router;
