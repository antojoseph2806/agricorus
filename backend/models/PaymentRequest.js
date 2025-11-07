const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
  {
    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: true },
    land: { type: mongoose.Schema.Types.ObjectId, ref: "Land", required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "paid"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    payoutMethod: { type: mongoose.Schema.Types.ObjectId, ref: "PayoutMethod", required: true },

    // ✅ Track full admin action history
    history: [
      {
        status: { type: String, enum: ["pending", "approved", "rejected", "paid"] },
        adminNote: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
      }
    ],
    adminNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
