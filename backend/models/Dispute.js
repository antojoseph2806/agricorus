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
  details: {
    type: String
  },
  attachments: [
    {
      url: String,
      name: String
    }
  ],
  dateOfIncident: {
    type: Date
  },
  amountInvolved: {
    type: Number
  },
  preferredResolution: {
    type: String
  },
  category: { 
  type: String, 
  enum: ["Lease Issue", "Payment Issue", "Service Issue", "Other"], 
  required: true 
},
  status: {
    type: String,
    enum: ["open", "resolved", "rejected"],
    default: "open"
  },
  response: {
    type: String,
    default: null
  },
  resolutionNote: String
}, { timestamps: true });

module.exports = mongoose.model("Dispute", disputeSchema);
