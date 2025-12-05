const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const agg = await Expense.aggregate([
    { $match: { userId: require('mongoose').Types.ObjectId(req.userId) } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } }
  ]);
  res.json({ byCategory: agg });
});

module.exports = router;
