// models/Investment.js
const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Investment", investmentSchema);
