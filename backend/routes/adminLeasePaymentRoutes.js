// adminLeasePaymentRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Lease = require("../models/Lease");
const PaymentRequest = require("../models/PaymentRequest");

// ✅ Middleware: only admin can access
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

/**
 * @route GET /api/admin/leases
 * @desc Get all leases (for admin)
 * @access Admin
 */
router.get("/leases", auth, adminOnly, async (req, res) => {
  try {
    const leases = await Lease.find()
      .populate("owner", "name email")
      .populate("farmer", "name email")
      .populate("land", "address area location")
      .sort({ createdAt: -1 });

    res.status(200).json({ leases });
  } catch (err) {
    console.error("❌ Error fetching leases:", err);
    res.status(500).json({ error: "Failed to fetch leases." });
  }
});

/**
 * @route GET /api/admin/leases/:leaseId/payments
 * @desc Get all payment requests for a lease (with history)
 * @access Admin
 */
router.get("/:leaseId/payments", auth, adminOnly, async (req, res) => {
  try {
    const { leaseId } = req.params;

    const lease = await Lease.findById(leaseId)
      .populate("owner", "name email")
      .populate("farmer", "name email")
      .populate("land", "address area location");

    if (!lease) return res.status(404).json({ error: "Lease not found." });

    const requests = await PaymentRequest.find({ lease: leaseId })
      .populate("payoutMethod", "type upiId bankName accountNumber ifscCode isDefault")
      .populate("farmer", "name email")
      .populate("owner", "name email")
      .populate("land", "address area location")
      .populate("history.changedBy", "name email")
      .sort({ requestedAt: -1 });

    res.status(200).json({ lease, requests });
  } catch (err) {
    console.error("❌ Error fetching lease payments:", err);
    res.status(500).json({ error: "Failed to fetch lease payment details." });
  }
});

/**
 * @route PATCH /api/admin/payments/:requestId
 * @desc Update a payment request (approve/reject/paid)
 * @access Admin
 */
router.patch("/payments/:requestId", auth, adminOnly, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNote } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${validStatuses.join(", ")}` });
    }

    const request = await PaymentRequest.findById(requestId).populate("lease");
    if (!request) return res.status(404).json({ error: "Payment request not found." });

    // ✅ Log history if status changes
    if (request.status !== status) {
      request.history = request.history || [];
      request.history.push({
        status,
        adminNote: adminNote || "",
        changedAt: new Date(),
        changedBy: req.user._id,
      });
    }

    // Update current status
    request.status = status;
    request.adminNote = adminNote || "";
    request.reviewedAt = new Date();

    // Update lease payments if marked as paid
    if (status === "paid" && request.lease) {
      if (request.lease.paymentsMade < request.lease.totalPayments) {
        request.lease.paymentsMade += 1;
        if (request.lease.paymentsMade >= request.lease.totalPayments) {
          request.lease.status = "completed";
        }
        await request.lease.save();
      }
    }

    await request.save();

    res.status(200).json({ message: `Payment request marked as '${status}'.`, request });
  } catch (err) {
    console.error("❌ Error updating payment request:", err);
    res.status(500).json({ error: "Failed to update payment request." });
  }
});

/**
 * @route GET /api/admin/payments/:requestId/history
 * @desc Get full history of a payment request
 * @access Admin
 */
router.get("/payments/:requestId/history", auth, adminOnly, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await PaymentRequest.findById(requestId)
      .populate("history.changedBy", "name email")
      .populate("farmer", "name email")
      .populate("owner", "name email")
      .populate("lease", "land paymentsMade totalPayments status");

    if (!request) return res.status(404).json({ error: "Payment request not found." });

    res.status(200).json({ requestId, history: request.history });
  } catch (err) {
    console.error("❌ Error fetching payment history:", err);
    res.status(500).json({ error: "Failed to fetch payment history." });
  }
});

/**
 * @route PATCH /api/admin/leases/:leaseId/manual-adjust
 * @desc Admin can manually adjust lease payment info
 * @access Admin
 */
router.patch("/leases/:leaseId/manual-adjust", auth, adminOnly, async (req, res) => {
  try {
    const { leaseId } = req.params;
    const { paymentsMade, totalPayments, pricePerMonth, status } = req.body;

    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json({ error: "Lease not found." });

    if (paymentsMade !== undefined) lease.paymentsMade = paymentsMade;
    if (totalPayments !== undefined) lease.totalPayments = totalPayments;
    if (pricePerMonth !== undefined) lease.pricePerMonth = pricePerMonth;
    if (status) lease.status = status;

    await lease.save();

    res.status(200).json({ message: "Lease payment details updated successfully.", lease });
  } catch (err) {
    console.error("❌ Error adjusting lease payment details:", err);
    res.status(500).json({ error: "Failed to adjust lease details." });
  }
});

module.exports = router;
