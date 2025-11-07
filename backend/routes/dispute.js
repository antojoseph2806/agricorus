const express = require("express");
const router = express.Router();
const Dispute = require("../models/Dispute");
const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * ======================================================
 * LANDOWNER / FARMER / INVESTOR DISPUTE ROUTES
 * ======================================================
 */

/**
 * 1️⃣ Raise a dispute
 */
router.post("/", auth, async (req, res) => {
  try {
    const {
      leaseId,
      paymentId,
      category,
      reason,
      details,
      attachments,
      dateOfIncident,
      amountInvolved,
      preferredResolution
    } = req.body;

    if (!category) return res.status(400).json({ error: "Category is required" });
    if (!reason) return res.status(400).json({ error: "Reason is required" });

    let lease = null,
      payment = null,
      againstUser = null;

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

    // ✅ Prevent duplicate open dispute for same record
    const existingDispute = await Dispute.findOne({
      raisedBy: req.user.id,
      ...(leaseId && { lease: leaseId }),
      ...(paymentId && { payment: paymentId }),
      status: "open"
    });

    if (existingDispute) {
      return res.status(400).json({
        error: "A dispute has already been raised for this record.",
        dispute: existingDispute
      });
    }

    const dispute = new Dispute({
      raisedBy: req.user.id,
      against: againstUser,
      lease: leaseId || null,
      payment: paymentId || null,
      category,
      reason,
      details,
      attachments,
      dateOfIncident,
      amountInvolved,
      preferredResolution
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
 * 3️⃣ Landowner views disputes raised against him
 */
router.get(
  "/against/me",
  auth,
  authorizeRoles("landowner", "farmer", "investor"),
  async (req, res) => {
    try {
      const disputes = await Dispute.find({ against: req.user.id })
        .populate("raisedBy", "name email")
        .populate("lease")
        .populate("payment");
      res.json(disputes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 4️⃣ View all OPEN disputes against the logged-in landowner
 */
router.get(
  "/against/me/open",
  auth,
  authorizeRoles("landowner"),
  async (req, res) => {
    try {
      const disputes = await Dispute.find({
        against: req.user.id,
        status: "open"
      })
        .populate("raisedBy", "name email")
        .populate("lease")
        .populate("payment");
      res.json(disputes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * ======================================================
 * ADMIN DISPUTE MANAGEMENT ROUTES
 * ======================================================
 * Base path: /api/disputes/admin
 * ======================================================
 */

/**
 * 5️⃣ Admin: View all disputes (filterable)
 */
router.get(
  "/admin/all",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { status, category } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (category) filter.category = category;

      const disputes = await Dispute.find(filter)
        .populate("raisedBy", "name email role")
        .populate("against", "name email role")
        .populate("lease", "leaseId")
        .populate("payment", "paymentId")
        .sort({ createdAt: -1 });

      res.status(200).json(disputes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error fetching disputes" });
    }
  }
);

/**
 * 6️⃣ Admin: Update dispute status (resolve/reject/review)
 */
router.put(
  "/admin/:id/status",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { status, resolutionNote } = req.body;

      if (!["open", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ msg: "Invalid status value" });
      }

      const dispute = await Dispute.findById(req.params.id);
      if (!dispute) return res.status(404).json({ msg: "Dispute not found" });

      dispute.status = status;
      dispute.resolutionNote = resolutionNote || "";
      dispute.actionTakenBy = req.user._id;
      dispute.actionTakenAt = new Date();

      await dispute.save();

      res.status(200).json({
        msg: "Dispute updated successfully",
        dispute
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Error updating dispute" });
    }
  }
);

module.exports = router;
