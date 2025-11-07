const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);
