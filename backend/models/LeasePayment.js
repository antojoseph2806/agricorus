const mongoose = require('mongoose');

const leasePaymentSchema = new mongoose.Schema(
  {
    lease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease',
      required: true,
      index: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    land: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Land',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    method: {
      type: String,
      default: 'razorpay'
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    },
    transactionId: {
      type: String,
      sparse: true
    },
    installmentNumber: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
leasePaymentSchema.index({ lease: 1, createdAt: -1 });
leasePaymentSchema.index({ farmer: 1, createdAt: -1 });
leasePaymentSchema.index({ owner: 1, createdAt: -1 });
leasePaymentSchema.index({ status: 1 });

module.exports = mongoose.model('LeasePayment', leasePaymentSchema);
