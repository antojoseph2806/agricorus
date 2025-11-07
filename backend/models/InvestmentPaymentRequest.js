// models/InvestmentPaymentRequest.js
const mongoose = require("mongoose");

const investmentPaymentRequestSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Investment", required: true },
  amount: { type: Number, required: true },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  adminRemarks: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("InvestmentPaymentRequest", investmentPaymentRequestSchema);
