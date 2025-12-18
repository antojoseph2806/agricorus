const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  kycStatus: { type: String, default: "Pending" }, // Pending | Approved | Rejected
  role: { type: String, default: "vendor" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vendor", vendorSchema);
