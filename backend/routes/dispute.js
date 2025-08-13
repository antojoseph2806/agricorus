const express = require("express");
const router = express.Router();
const Dispute = require("../models/Dispute");
const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * 1️⃣ Raise a dispute
 */
router.post("/", auth, async (req, res) => {
  try {
    const { leaseId, paymentId, reason } = req.body;

    if (!reason) return res.status(400).json({ error: "Reason is required" });

    let lease = null, payment = null, againstUser = null;

    if (leaseId) {
      lease = await Lease.findById(leaseId);
      if (!lease) return res.status(404).json({ error: "Lease not found" });
      againstUser = lease.owner.equals(req.user.id) ? lease.farmer : lease.owner;
    }

    if (paymentId) {
      payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ error: "Payment not found" });
      againstUser = payment.payee.equals(req.user.id) ? payment.payer : payment.payee;
    }

    const dispute = new Dispute({
      raisedBy: req.user.id,
      against: againstUser,
      lease: leaseId || null,
      payment: paymentId || null,
      reason
    });

    await dispute.save();
    res.status(201).json({ message: "Dispute raised successfully", dispute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2️⃣ View disputes raised by the logged-in user
 */
router.get("/my", auth, async (req, res) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user.id })
      .populate("lease")
      .populate("payment");
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ Admin views all disputes
 */
router.get("/", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("raisedBy", "name email")
      .populate("against", "name email")
      .populate("lease")
      .populate("payment");
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ Admin resolves or rejects a dispute
 */
router.put("/:id/resolve", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    if (!["resolved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ error: "Dispute not found" });

    dispute.status = status;
    dispute.resolutionNote = resolutionNote;
    await dispute.save();

    res.json({ message: "Dispute updated successfully", dispute });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
