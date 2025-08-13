const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema({
  land: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Land",
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  durationMonths: {
    type: Number,
    required: true
  },
  pricePerMonth: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  agreementUrl: String, // Will store digital agreement link
}, { timestamps: true });

module.exports = mongoose.model("Lease", leaseSchema);
