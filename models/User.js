const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  googleId: { type: String, default: null },
  avatar: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
