const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    amount: { type: Number, required: true },
    paymentId: { type: String, required: true }, // Razorpay payment ID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
