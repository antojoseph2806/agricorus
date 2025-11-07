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
      required: true, // keep as ObjectId; remove ref if you don’t have a model
    },
    payoutMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayoutMethod", // corrected to match your model name
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    adminComment: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
