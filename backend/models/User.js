// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },

  phone: {
    type: String,
    unique: true,
    sparse: true, // <-- This line is critical
    required: false,
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['landowner', 'farmer', 'investor', 'admin'],
    required: false,
  },
});

module.exports = mongoose.model('User', userSchema);
