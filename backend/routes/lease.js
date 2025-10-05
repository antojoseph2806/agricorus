const express = require("express");
const router = express.Router();
const Lease = require("../models/Lease");
const Land = require("../models/Land");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const generateLeasePDF = require("../utils/generateLeasePDF");
const cloudinary = require("cloudinary").v2;

/**
 * Landowner views all lease requests for their lands.
 */
router.get("/owner/requests", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({ owner: req.user.id })
      .populate("land", "title location landPhotos") // 👈 Added 'landPhotos' here
      .populate("farmer", "name email phone");

    res.json(leases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Landowner views all pending lease requests.
 */
router.get("/owner/requests/pending", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({ owner: req.user.id, status: "pending" })
      .populate("land")
      .populate("farmer", "name email");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Landowner views all accepted lease requests.
 */
router.get("/owner/requests/accepted", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({ owner: req.user.id, status: "accepted" })
      .populate("land")
      .populate("farmer", "name email");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Landowner views all cancelled lease requests.
 */
router.get("/owner/requests/cancelled", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({ owner: req.user.id, status: "cancelled" })
      .populate("land")
      .populate("farmer", "name email");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * Landowner views all active lease requests.
 */
router.get("/owner/requests/active", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({ owner: req.user.id, status: "active" })
      .populate("land")
      .populate("farmer", "name email phone");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//----------------------------------------------------------------

/**
 * Landowner accepts a lease request.
 */
router.put("/:leaseId/accept", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, owner: req.user.id })
      .populate("land")
      .populate("farmer")
      .populate("owner");
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    lease.status = "accepted";
    await lease.save();

    res.json({ message: "Lease accepted by landowner.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//----------------------------------------------------------------

/**
 * Landowner cancels (rejects) a lease request.
 */
router.put("/:leaseId/cancel", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, owner: req.user.id });
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    lease.status = "cancelled";
    await lease.save();

    res.json({ message: "Lease cancelled by landowner.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Farmer or Landowner can download/view the Lease Agreement (if generated)
 */
router.get("/:leaseId/agreement", auth, async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId);

    if (!lease) return res.status(404).json({ error: "Lease not found" });

    // ✅ Only farmer or owner can view
    if (
      lease.farmer.toString() !== req.user.id &&
      lease.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!lease.agreementUrl) {
      return res.status(404).json({ error: "Agreement not generated yet." });
    }

    // Send download response
    res.download(lease.agreementUrl, `Lease_Agreement_${lease._id}.pdf`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get total number of leases (all or active only)
 */
router.get("/owner/total-leases", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    // Count ALL leases owned by this landowner
    const totalLeases = await Lease.countDocuments({ owner: req.user.id });

    // Count only ACTIVE leases for this landowner
    const activeLeases = await Lease.countDocuments({ owner: req.user.id, status: "active" });

    res.json({
      totalLeases,
      activeLeases
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Landowner views leases eligible for requesting payment from admin.
 * Eligible leases: status "active" and no pending payment request
 */
router.get("/owner/eligible-payments", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({
      owner: req.user.id,
      status: "active",
      $or: [
        { paymentRequest: { $exists: false } },       // No request yet
        { "paymentRequest.status": "paid" },          // Last request completed
      ],
    })
      .populate("land", "title location")
      .populate("farmer", "name email phone");

    res.json(leases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
