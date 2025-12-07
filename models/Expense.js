const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true },
  currencyCode: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
