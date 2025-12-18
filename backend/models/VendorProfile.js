const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      unique: true,
      index: true
    },
    
    // Basic Profile
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters']
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
      maxlength: [100, 'Owner name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    
    // Address
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
        maxlength: [500, 'Street address cannot exceed 500 characters']
      },
      district: {
        type: String,
        required: [true, 'District is required'],
        trim: true,
        maxlength: [100, 'District cannot exceed 100 characters']
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [100, 'State cannot exceed 100 characters']
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true,
        match: [/^\d{6}$/, 'Pincode must be 6 digits']
      }
    },
    
    // Business Details
    businessType: {
      type: String,
      enum: {
        values: ['Individual', 'Partnership', 'PvtLtd', 'LLP'],
        message: 'Business type must be one of: Individual, Partnership, PvtLtd, LLP'
      },
      required: [true, 'Business type is required']
    },
    establishedYear: {
      type: Number,
      min: [1900, 'Established year must be after 1900'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future']
    },
    
    // KYC Details
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN']
    },
    panNumber: {
      type: String,
      required: [true, 'PAN number is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number (e.g., ABCDE1234F)']
    },
    aadharNumber: {
      type: String,
      trim: true,
      match: [/^\d{12}$/, 'Aadhaar number must be 12 digits']
    },
    
    // Bank Details
    bankDetails: {
      accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true,
        maxlength: [100, 'Account holder name cannot exceed 100 characters']
      },
      accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true,
        match: [/^\d{9,18}$/, 'Account number must be between 9 and 18 digits']
      },
      ifscCode: {
        type: String,
        required: [true, 'IFSC code is required'],
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code (e.g., SBIN0001234)']
      },
      bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true,
        maxlength: [200, 'Bank name cannot exceed 200 characters']
      }
    },
    
    // Document Uploads
    panCard: {
      type: String,
      required: [true, 'PAN card document is required']
    },
    aadharCard: {
      type: String
    },
    gstCertificate: {
      type: String
    },
    bankProof: {
      type: String,
      required: [true, 'Bank proof document is required']
    },
    businessLicense: {
      type: String
    },
    
    // Verification Status
    kycStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'],
        message: 'KYC status must be one of: PENDING, SUBMITTED, VERIFIED, REJECTED'
      },
      default: 'PENDING',
      index: true
    },
    rejectionReason: {
      type: String,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters']
    },
    submittedAt: {
      type: Date
    },
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Indexes for efficient queries
vendorProfileSchema.index({ vendorId: 1 });
vendorProfileSchema.index({ kycStatus: 1 });
vendorProfileSchema.index({ panNumber: 1 });

// Pre-save middleware to set submittedAt when status changes to SUBMITTED
vendorProfileSchema.pre('save', function(next) {
  if (this.isModified('kycStatus') && this.kycStatus === 'SUBMITTED' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  if (this.isModified('kycStatus') && this.kycStatus === 'VERIFIED' && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);

