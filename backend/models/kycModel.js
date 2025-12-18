const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  documentType: {
    type: String,
    enum: ['Aadhaar', 'PAN', 'Passport', 'DrivingLicense'],
    required: true
  },
  documentImage: {
    type: String, // file path or URL if using Cloudinary
    required: true
  },
  extractedText: {
    type: String
  },
  extractedNumber: {
    type: String,
    sparse: true // allows null but enforces uniqueness when present
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index for faster queries
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });
kycSchema.index({ extractedNumber: 1 }, { sparse: true });

module.exports = mongoose.model('KYC', kycSchema);
