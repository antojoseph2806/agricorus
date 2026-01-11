const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  district: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{6}$/
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
addressSchema.index({ userId: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

// Index for efficient queries
addressSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Address', addressSchema);