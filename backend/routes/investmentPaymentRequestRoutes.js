// routes/investmentPaymentRequestRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const Investment = require("../models/Investment");
const InvestmentPaymentRequest = require("../models/InvestmentPaymentRequest");

const router = express.Router();

/* -----------------------------------------
   CREATE PAYMENT REQUEST (Investor only)
------------------------------------------ */
router.post("/", auth, authorizeRoles("investor"), async (req, res) => {
  try {
    const { investmentId, amount, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(investmentId)) {
      return res.status(400).json({ message: "Invalid investment ID" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    // Verify the investment belongs to this investor
    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    if (investment.investorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized for this investment" });
    }

    // Prevent duplicate pending requests for same investment
    const existingRequest = await InvestmentPaymentRequest.findOne({
      investorId: req.user._id,
      investmentId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "A pending request already exists for this investment" });
    }

    const request = new InvestmentPaymentRequest({
      investorId: req.user._id,
      investmentId,
      amount,
      reason,
    });

    await request.save();

    res.status(201).json({ message: "Payment request created successfully", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to create payment request", error: err.message });
  }
});

/* -----------------------------------------
   VIEW ALL OWN PAYMENT REQUESTS (Investor)
------------------------------------------ */
router.get("/my-requests", auth, authorizeRoles("investor"), async (req, res) => {
  try {
    const requests = await InvestmentPaymentRequest.find({ investorId: req.user._id })
      .populate("investmentId", "projectId amount paymentId")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

/* -----------------------------------------
   VIEW ALL PAYMENT REQUESTS (Admin)
------------------------------------------ */
router.get("/admin/all", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const requests = await InvestmentPaymentRequest.find()
      .populate("investorId", "name email")
      .populate({
        path: "investmentId",
        populate: { path: "projectId", select: "title" },
        select: "amount",
      })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all payment requests", error: err.message });
  }
});

/* -----------------------------------------
   ADMIN APPROVE / REJECT PAYMENT REQUEST
------------------------------------------ */
router.patch("/:id/status", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await InvestmentPaymentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    request.adminRemarks = adminRemarks || "";
    await request.save();

    res.json({ message: `Request ${status} successfully`, request });
  } catch (err) {
    res.status(500).json({ message: "Failed to update request", error: err.message });
  }
});

module.exports = router;