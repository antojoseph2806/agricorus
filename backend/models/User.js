// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,   // ✅ allows multiple nulls
    default: null,  // ✅ explicitly set null if not provided
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['landowner', 'farmer', 'investor', 'admin'],
    default: null,  // ✅ so new Google users don’t break
  },
});

module.exports = mongoose.model('User', userSchema);
