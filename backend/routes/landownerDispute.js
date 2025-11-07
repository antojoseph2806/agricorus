const express = require("express");
const router = express.Router();
const Lease = require("../models/Lease");
const Dispute = require("../models/Dispute");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const cloudinary = require("cloudinary").v2;

/**
 * ======================================================
 * LANDOWNER DISPUTE ROUTES
 * ======================================================
 * Base path example: /api/landowner/disputes
 * ======================================================
 */

/**
 * ------------------------------------------------------
 * 1️⃣ Landowner raises a dispute against a farmer
 * ------------------------------------------------------
 */
router.post("/:leaseId", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId).populate("owner farmer");
    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You do not own this lease." });
    }

    const existing = await Dispute.findOne({
      lease: lease._id,
      raisedBy: req.user.id,
      status: "open",
    });

    if (existing) {
      return res.status(400).json({ error: "An open dispute already exists for this lease." });
    }

    const {
      reason,
      details,
      category,
      dateOfIncident,
      amountInvolved,
      preferredResolution,
      attachments,
    } = req.body;

    if (!reason || !category) {
      return res.status(400).json({ error: "Reason and category are required." });
    }

    const dispute = new Dispute({
      raisedBy: req.user.id,
      against: lease.farmer?._id,
      lease: lease._id,
      reason,
      details,
      category,
      dateOfIncident,
      amountInvolved,
      preferredResolution,
      attachments: Array.isArray(attachments) ? attachments : [],
      status: "open",
    });

    await dispute.save();

    res.status(201).json({
      message: "Dispute raised successfully.",
      dispute,
    });
  } catch (err) {
    console.error("Dispute creation error:", err);
    res.status(500).json({ error: "Server error while raising dispute." });
  }
});

/**
 * ------------------------------------------------------
 * 2️⃣ Landowner views all disputes they have raised
 * ------------------------------------------------------
 */
router.get("/", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user.id })
      .populate("lease", "title location status")
      .populate("against", "name email role")
      .sort({ createdAt: -1 });

    res.json({ count: disputes.length, disputes });
  } catch (err) {
    console.error("Landowner disputes fetch error:", err);
    res.status(500).json({ error: "Server error while fetching disputes." });
  }
});

/**
 * ------------------------------------------------------
 * 3️⃣ Landowner views disputes for a specific lease
 * ------------------------------------------------------
 */
router.get("/lease/:leaseId", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId).populate("owner farmer");
    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: This lease does not belong to you." });
    }

    const disputes = await Dispute.find({ lease: lease._id })
      .populate("raisedBy", "name email role")
      .populate("against", "name email role")
      .sort({ createdAt: -1 });

    if (!disputes.length) {
      return res.status(404).json({ message: "No disputes found for this lease." });
    }

    res.json({ count: disputes.length, disputes });
  } catch (err) {
    console.error("Fetch lease disputes error:", err);
    res.status(500).json({ error: "Server error while fetching lease disputes." });
  }
});

/**
 * ======================================================
 * ADMIN DISPUTE MANAGEMENT ROUTES
 * ======================================================
 * Base path example: /api/admin/disputes
 * ======================================================
 */

/**
 * ------------------------------------------------------
 * 4️⃣ Admin: View all disputes raised by landowners
 * ------------------------------------------------------
 * GET /api/admin/disputes?status=open|resolved|rejected
 */
router.get("/admin/all", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const disputes = await Dispute.find(filter)
      .populate("raisedBy", "name email role")
      .populate("against", "name email role")
      .populate("lease", "title location")
      .sort({ createdAt: -1 });

    res.json({
      count: disputes.length,
      disputes,
    });
  } catch (err) {
    console.error("Admin fetch disputes error:", err);
    res.status(500).json({ error: "Server error while fetching disputes." });
  }
});

/**
 * ------------------------------------------------------
 * 5️⃣ Admin: Take action on a dispute
 * ------------------------------------------------------
 * PATCH /api/admin/disputes/:disputeId/action
 * Body:
 * {
 *   action: "resolved" | "rejected" | "in_review",
 *   adminRemarks: "Your remarks here"
 * }
 */
router.patch("/admin/:disputeId/action", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { action, adminRemarks } = req.body;

    if (!["resolved", "rejected", "in_review"].includes(action)) {
      return res.status(400).json({
        error: "Invalid action. Must be one of: resolved, rejected, in_review.",
      });
    }

    const dispute = await Dispute.findById(req.params.disputeId)
      .populate("raisedBy", "name email")
      .populate("against", "name email");

    if (!dispute) {
      return res.status(404).json({ error: "Dispute not found." });
    }

    dispute.status = action;
    dispute.adminRemarks = adminRemarks || "";
    dispute.actionTakenBy = req.user.id;
    dispute.actionTakenAt = new Date();

    await dispute.save();

    res.json({
      message: `Dispute ${action} successfully.`,
      dispute,
    });
  } catch (err) {
    console.error("Admin dispute action error:", err);
    res.status(500).json({ error: "Server error while taking action on dispute." });
  }
});

module.exports = router;
