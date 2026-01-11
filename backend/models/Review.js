const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    // New fields for photo uploads
    photos: [{
      url: {
        type: String,
        required: true
      },
      caption: {
        type: String,
        maxlength: 200
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Helpful/unhelpful votes from other users
    helpfulVotes: {
      type: Number,
      default: 0
    },
    unhelpfulVotes: {
      type: Number,
      default: 0
    },
    // Verification status
    isVerifiedPurchase: {
      type: Boolean,
      default: true // Since reviews are only allowed after delivery
    }
  },
  { timestamps: true }
);

reviewSchema.index({ buyerId: 1, orderId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ helpfulVotes: -1 });

// Virtual for total votes
reviewSchema.virtual('totalVotes').get(function() {
  return this.helpfulVotes + this.unhelpfulVotes;
});

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.totalVotes;
  return total > 0 ? (this.helpfulVotes / total) : 0;
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);


