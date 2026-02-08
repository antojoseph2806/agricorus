const mongoose = require('mongoose');

const supportQuerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['landowner', 'farmer', 'investor'],
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  messages: [{
    message: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'vendor'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
supportQuerySchema.index({ vendorId: 1, status: 1 });
supportQuerySchema.index({ userId: 1 });
supportQuerySchema.index({ orderId: 1 });

module.exports = mongoose.model('SupportQuery', supportQuerySchema);
