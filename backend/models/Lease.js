const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema(
  {
    land: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",    // farmer applied
        "accepted",   // owner approved
        "active",     // payment successful, lease started
        "completed",  // lease finished
        "terminated", // ended early
        "cancelled",  // cancelled before starting
      ],
      default: "pending",
    },
    agreementUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lease", leaseSchema);
