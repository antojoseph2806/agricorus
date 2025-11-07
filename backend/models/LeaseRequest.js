// models/LeaseRequest.js
const mongoose = require('mongoose');

const LeaseRequestSchema = new mongoose.Schema({
  land: { type: mongoose.Schema.Types.ObjectId, ref: 'Land', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: Date,
  endDate: Date,
  terms: String,
  amount: Number,
  status: { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
  escrowId: String, // stub for escrow provider
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaseRequest', LeaseRequestSchema);
