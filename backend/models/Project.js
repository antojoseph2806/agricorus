const mongoose = require("mongoose");
const slugify = require("slugify");

const projectSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  cropType: { type: String },
  fundingGoal: { type: Number, required: true },
  currentFunding: { type: Number, default: 0 },
  status: { type: String, enum: ["open", "funded", "closed"], default: "open" },
  isApproved: { type: Boolean, default: false },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  slug: {
    type: String,
    unique: true, // This ensures the slug is unique across all projects
  },
  
  // Farmer Identity Verification
  farmerVerification: {
    aadhaarNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{12}$/.test(v);
        },
        message: 'Aadhaar number must be 12 digits'
      }
    },
    aadhaarDocument: {
      type: String, // File path
      required: true
    },
    govtIdType: {
      type: String,
      enum: ['AADHAAR', 'VOTER_ID', 'DRIVING_LICENSE', 'PASSPORT'],
      required: true
    },
    govtIdNumber: {
      type: String,
      required: true
    },
    govtIdDocument: {
      type: String, // File path
      required: true
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verificationNotes: String,
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },

  // Detailed Land Information
  landDetails: {
    // Administrative Details
    state: { type: String, required: true },
    district: { type: String, required: true },
    tehsil: { type: String, required: true },
    village: { type: String, required: true },
    panchayat: { type: String, required: true },
    municipality: String, // Optional for urban areas
    
    // Address Details
    address: {
      street: String,
      landmark: String,
      pincode: {
        type: String,
        required: true,
        validate: {
          validator: function(v) {
            return /^\d{6}$/.test(v);
          },
          message: 'Pincode must be 6 digits'
        }
      }
    },
    
    // Land Specifications
    surveyNumber: { type: String, required: true },
    subDivisionNumber: String,
    landArea: {
      value: { type: Number, required: true, min: 0.1 },
      unit: { type: String, enum: ['ACRE', 'HECTARE', 'BIGHA', 'GUNTHA'], required: true }
    },
    landType: {
      type: String,
      enum: ['AGRICULTURAL', 'IRRIGATED', 'DRY_LAND', 'ORCHARD', 'PLANTATION'],
      required: true
    },
    soilType: {
      type: String,
      enum: ['ALLUVIAL', 'BLACK', 'RED', 'LATERITE', 'DESERT', 'MOUNTAIN', 'SALINE']
    },
    irrigationSource: {
      type: String,
      enum: ['BORE_WELL', 'CANAL', 'RIVER', 'POND', 'RAIN_FED', 'DRIP', 'SPRINKLER']
    },
    
    // GPS Coordinates
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    }
  },

  // Land Ownership Proof
  landOwnership: {
    ownershipType: {
      type: String,
      enum: ['OWNED', 'LEASED', 'FAMILY_OWNED', 'COOPERATIVE'],
      required: true
    },
    ownerName: { type: String, required: true },
    relationToOwner: {
      type: String,
      enum: ['SELF', 'FATHER', 'MOTHER', 'SPOUSE', 'BROTHER', 'SISTER', 'OTHER'],
      required: true
    },
    
    // Ownership Documents
    documents: [{
      type: {
        type: String,
        enum: ['PATTA', 'KHATA', 'PAHANI', 'KHASRA', 'REVENUE_RECORD', 'SALE_DEED', 'LEASE_DEED', 'MUTATION_RECORD'],
        required: true
      },
      documentNumber: { type: String, required: true },
      filePath: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verificationNotes: String,
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },

  // Geo-tagged Media
  landMedia: {
    photos: [{
      filePath: { type: String, required: true },
      description: String,
      geoTag: {
        latitude: Number,
        longitude: Number,
        accuracy: Number, // GPS accuracy in meters
        timestamp: { type: Date, default: Date.now }
      },
      uploadedAt: { type: Date, default: Date.now }
    }],
    videos: [{
      filePath: { type: String, required: true },
      description: String,
      duration: Number, // in seconds
      geoTag: {
        latitude: Number,
        longitude: Number,
        accuracy: Number,
        timestamp: { type: Date, default: Date.now }
      },
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Media Requirements Validation
    minimumPhotos: { type: Number, default: 5 },
    minimumVideos: { type: Number, default: 1 },
    
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verificationNotes: String,
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },

  // Overall Verification Status
  overallVerificationStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
    default: 'DRAFT'
  },
  
  // Admin Review
  adminReview: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String
  }
}, { timestamps: true });

// Mongoose pre-save middleware to generate a unique slug
projectSchema.pre("save", async function (next) {
  // Only run this middleware if the title has been modified or it's a new document
  if (this.isModified("title") || this.isNew) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check if a project with the generated slug already exists
    while (true) {
      const existingProject = await this.constructor.findOne({ slug });
      if (!existingProject) {
        // If no existing project found, the slug is unique
        break;
      }
      // If a duplicate is found, append a counter and check again
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
