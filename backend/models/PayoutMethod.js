const mongoose = require("mongoose");

const payoutMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["landowner", "farmer", "investor"], // add all valid roles here
      required: true,
    },
    type: {
      type: String,
      enum: ["bank", "upi"],
      required: true,
    },

    // UPI fields
    upiId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedName: {
      type: String,
      trim: true,
    },
    verificationDate: {
      type: Date,
    },

    // Bank fields
    accountHolderName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },

    // General
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayoutMethod", payoutMethodSchema);
