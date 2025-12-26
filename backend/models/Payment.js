const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'razorpay', 'bank_transfer'],
      required: true
    },
    // Vendor's share of the payment
    vendorAmount: {
      type: Number,
      required: true,
      min: [0, 'Vendor amount cannot be negative']
    },
    // Platform commission
    platformFee: {
      type: Number,
      default: 0,
      min: [0, 'Platform fee cannot be negative']
    },
    // Total amount paid by buyer
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
      index: true
    },
    // Razorpay specific fields
    razorpayOrderId: {
      type: String,
      sparse: true
    },
    razorpayPaymentId: {
      type: String,
      sparse: true
    },
    razorpayRefundId: {
      type: String,
      sparse: true
    },
    // Payment dates
    paidAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    // Refund information
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundReason: {
      type: String,
      maxlength: [500, 'Refund reason cannot exceed 500 characters']
    },
    refundStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'NONE'
    },
    refundRequestedBy: {
      type: String,
      enum: ['BUYER', 'VENDOR', 'ADMIN'],
    },
    refundRequestedAt: {
      type: Date
    },
    // Settlement information
    settlementStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SETTLED', 'FAILED'],
      default: 'PENDING'
    },
    settledAt: {
      type: Date
    },
    settlementAmount: {
      type: Number,
      min: [0, 'Settlement amount cannot be negative']
    },
    // Additional metadata
    paymentGatewayResponse: {
      type: mongoose.Schema.Types.Mixed
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
paymentSchema.index({ vendorId: 1, createdAt: -1 });
paymentSchema.index({ buyerId: 1, createdAt: -1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ refundStatus: 1 });
paymentSchema.index({ settlementStatus: 1 });

// Virtual for net amount after refunds
paymentSchema.virtual('netAmount').get(function() {
  return this.vendorAmount - this.refundAmount;
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);