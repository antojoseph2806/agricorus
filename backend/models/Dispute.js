const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lease"
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["open", "resolved", "rejected"],
    default: "open"
  },
  resolutionNote: String
}, { timestamps: true });

module.exports = mongoose.model("Dispute", disputeSchema);
