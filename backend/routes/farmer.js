// routes/farmer.js

const express = require("express");
const router = express.Router();
const Land = require("../models/Land");
const Lease = require("../models/Lease");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * 1️⃣ GET ALL AVAILABLE LANDS (VIEW ALL LANDOWNERS' LISTINGS)
 * A farmer can view all lands that are approved by the admin and available for lease.
 */
router.get("/lands/available", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lands = await Land.find({ isApproved: true, status: 'available' });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET LAND BY ID (for farmer)
router.get("/farmer/lands/:landId", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId)
      .populate("owner", "email phone"); // <-- populate owner email & phone

    if (!land) return res.status(404).json({ error: "Land not found" });

    // Get current user's lease if exists
    const lease = await Lease.findOne({ land: land._id, farmer: req.user.id });

    res.json({
      ...land.toObject(),
      currentUserLease: lease || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2️⃣ REQUEST A LEASE
 * A farmer can make a lease request for a specific land.
 */
router.post("/leases/:landId/request", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId);
    if (!land) return res.status(404).json({ error: "Land not found" });
    if (land.status !== "available") return res.status(400).json({ error: "Land is not available" });

    // Check if a lease request already exists for this farmer and land
    const existingLease = await Lease.findOne({
      land: land._id,
      farmer: req.user.id,
      status: "pending"
    });
    if (existingLease) {
      return res.status(400).json({ error: "You have already submitted a pending request for this land." });
    }

    const lease = new Lease({
      land: land._id,
      farmer: req.user.id,
      owner: land.owner,
      durationMonths: req.body.durationMonths || land.leaseDurationMonths,
      pricePerMonth: land.leasePricePerMonth
    });

    await lease.save();
    res.status(201).json({ message: "Lease request submitted successfully. Awaiting landowner approval.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ CANCEL A LEASE REQUEST
 * A farmer can cancel their own pending lease request.
 */
router.put("/leases/:leaseId/cancel", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lease = await Lease.findOne({ 
      _id: req.params.leaseId, 
      farmer: req.user.id, 
      status: "pending" 
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease request not found or cannot be cancelled." });
    }

    // Set the status to 'rejected' to signify it was cancelled
    lease.status = "rejected";
    await lease.save();

    res.json({ message: "Lease request cancelled successfully.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;