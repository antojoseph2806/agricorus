// routes/farmer.js

const express = require("express");
const router = express.Router();
const Land = require("../models/Land");
const Lease = require("../models/Lease");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * 1️⃣ GET ALL AVAILABLE LANDS
 * A farmer can view all lands that are approved by the admin and available for lease.
 * Endpoint: GET /api/farmer/lands/available
 */
router.get("/lands/available", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lands = await Land.find({ isApproved: true, status: "available" });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * 🌍 Public: Get all approved & available lands
 */
router.get("/lands/public/available", async (req, res) => {
  try {
    const lands = await Land.find({ isApproved: true, status: "available" })
      .sort({ createdAt: -1 }); // newest lands first

    res.status(200).json(lands);
  } catch (err) {
    console.error("Error fetching available lands:", err);
    res.status(500).json({ error: "Server error while fetching lands." });
  }
});


/**
 * 2️⃣ GET LAND BY ID (with current user lease info) - FOR FARMER
 * Endpoint: GET /api/farmer/lands/:landId
 */
router.get("/lands/:landId", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId).populate("owner", "email phone");

    if (!land) return res.status(404).json({ error: "Land not found" });

    // Check if this farmer already has a lease on this land
    const lease = await Lease.findOne({ land: land._id, farmer: req.user.id });

    res.json({
      ...land.toObject(),
      currentUserLease: lease || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET LAND BY ID - FOR PUBLIC VIEW
 * Endpoint: GET /api/lands/public/:landId
 */
router.get("/lands/public/:landId", async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId);

    if (!land) {
      return res.status(404).json({ error: "Land not found" });
    }

    // Only return public info (exclude owner/lease info)
    res.json({
      _id: land._id,
      title: land.title,
      location: land.location,
      soilType: land.soilType,
      leasePricePerMonth: land.leasePricePerMonth,
      leaseDurationMonths: land.leaseDurationMonths,
      landPhotos: land.landPhotos,
      landDocuments: land.landDocuments,
      status: land.status,
      isApproved: land.isApproved,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * 3️⃣ REQUEST A LEASE
 * Endpoint: POST /api/farmer/leases/:landId/request
 */
router.post("/leases/:landId/request", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId);
    if (!land) return res.status(404).json({ error: "Land not found" });
    if (land.status !== "available")
      return res.status(400).json({ error: "Land is not available" });

    // Prevent duplicate pending requests
    const existingLease = await Lease.findOne({
      land: land._id,
      farmer: req.user.id,
      status: "pending",
    });
    if (existingLease) {
      return res
        .status(400)
        .json({ error: "You already submitted a pending request for this land." });
    }

    const lease = new Lease({
      land: land._id,
      farmer: req.user.id,
      owner: land.owner,
      durationMonths: req.body.durationMonths || land.leaseDurationMonths,
      pricePerMonth: land.leasePricePerMonth,
      status: "pending",
    });

    await lease.save();
    res
      .status(201)
      .json({ message: "Lease request submitted successfully. Awaiting owner approval.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ CANCEL A LEASE REQUEST
 * Endpoint: PUT /api/farmer/leases/:leaseId/cancel
 */
router.put("/leases/:leaseId/cancel", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lease = await Lease.findOne({
      _id: req.params.leaseId,
      farmer: req.user.id,
      status: "pending",
    });

    if (!lease) {
      return res
        .status(404)
        .json({ error: "Lease request not found or cannot be cancelled." });
    }

    // Mark as cancelled (by farmer)
    lease.status = "cancelled";
    await lease.save();

    res.json({ message: "Lease request cancelled successfully.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5️⃣ VIEW ALL LEASES BY STATUS
 */

// View all accepted leases
// Endpoint: GET /api/farmer/leases/accepted
router.get("/leases/accepted", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const leases = await Lease.find({ farmer: req.user.id, status: "accepted" })
      .populate("land")
      .populate("owner", "email phone");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View all cancelled leases
// Endpoint: GET /api/farmer/leases/cancelled
router.get("/leases/cancelled", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const leases = await Lease.find({
      farmer: req.user.id,
      status: "cancelled",
    })
      .populate("land")
      .populate("owner", "email phone");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// View all active leases
// Endpoint: GET /api/farmer/leases/active
// View all active leases (farmer)
router.get("/leases/active", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const leases = await Lease.find({
      farmer: req.user.id,
      status: "active",   // 👈 FIXED (was "accepted")
    })
      .populate("land")
      .populate("owner", "email phone");

    // Optionally, keep date filtering if you want only leases still within duration
    const activeLeases = leases.filter((lease) => {
      const startDate = new Date(lease.createdAt);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + lease.durationMonths);
      return new Date() <= endDate;
    });

    res.json(activeLeases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// (Optional) View all leases for this farmer
// Endpoint: GET /api/farmer/leases
router.get("/leases", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const leases = await Lease.find({ farmer: req.user.id })
      .populate("land")
      .populate("owner", "email phone");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
