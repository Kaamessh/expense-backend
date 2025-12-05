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
  const { date, category, description, amount } = req.body;
  if (!date || !category || amount == null) return res.status(400).json({ error: 'Missing fields' });
  const exp = await Expense.create({ userId: req.userId, date, category, description, amount });
  res.status(201).json(exp);
});

module.exports = router;
