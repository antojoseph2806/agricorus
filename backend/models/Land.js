const mongoose = require("mongoose");

const landSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  soilType: {
    type: String,
    required: true
  },
  waterSource: String,
  accessibility: String,
  sizeInAcres: {
    type: Number,
    required: true
  },
  leasePricePerMonth: {
    type: Number,
    required: true
  },
  leaseDurationMonths: {
    type: Number,
    required: true
  },
  landPhotos: [String], // ✅ New field for land photos
  landDocuments: [String], // ✅ New field for land documents
  status: {
    type: String,
    enum: ["available", "leased", "inactive"],
    default: "available"
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Land", landSchema);