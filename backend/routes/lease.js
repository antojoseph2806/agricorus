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
      .populate("land", "title location")     // only pull fields you need
      .populate("farmer", "name email phone"); // 👈 include phone here

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

module.exports = router;
