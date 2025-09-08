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
    durationMonths: { type: Number, required: true },
    pricePerMonth: { type: Number, required: true },

    // Lease lifecycle
    status: {
      type: String,
      enum: ["pending", "accepted", "active", "completed", "terminated", "cancelled"],
      default: "pending",
    },

    // Installment tracking
    paymentsMade: { type: Number, default: 0 }, // installments paid
    totalPayments: { type: Number }, // auto set = durationMonths

    // Agreement PDF
    agreementUrl: String,
  },
  { timestamps: true }
);

// Auto set totalPayments
leaseSchema.pre("save", function (next) {
  if (!this.totalPayments) {
    this.totalPayments = this.durationMonths;
  }
  next();
});

module.exports = mongoose.model("Lease", leaseSchema);
