const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lease",
    required: true
  },
  payer: { // usually farmer
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  payee: { // usually landowner
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["escrow", "released", "refunded"],
    default: "escrow"
  },
  releaseRequested: {
    type: Boolean,
    default: false
  },
  transactionId: String, // Payment gateway reference
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
