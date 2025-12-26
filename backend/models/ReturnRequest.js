const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    payoutMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayoutMethod",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "paid"],
      default: "pending",
    },
    adminComment: {
      type: String,
    },
    // Payment receipt/proof fields
    paymentReceipt: { type: String }, // URL to uploaded receipt
    paymentDate: { type: Date },
    transactionId: { type: String },
    amountPaid: { type: Number },
    
    // Track admin action history
    history: [
      {
        status: { type: String, enum: ["pending", "approved", "rejected", "completed", "paid"] },
        adminNote: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
      }
    ],
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
