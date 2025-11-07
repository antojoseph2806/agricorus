// routes/admin.js
const express = require("express");
const router = express.Router();
const Land = require("../models/Land");
const Payment = require("../models/Payment");

// Middlewares
let auth, authorizeRoles;
try {
  auth = require("../middleware/auth");
} catch (err) {
  console.warn("⚠️ auth middleware not found — using dummy");
  auth = (req, res, next) => next();
}
try {
  authorizeRoles = require("../middleware/authorizeRoles");
} catch (err) {
  console.warn("⚠️ authorizeRoles middleware not found — allowing all");
  authorizeRoles = () => (req, res, next) => next();
}

/**
 * 1️⃣ GET ALL LANDS (ADMIN ONLY)
 * Fetches all land listings.
 */
router.get("/lands/all", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    // ✅ Correctly populate owner details
    const lands = await Land.find({}).populate('owner', 'name email');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2️⃣ GET PENDING LANDS (ADMIN ONLY)
 * Fetches lands that have isApproved: false AND no rejectionReason.
 */
router.get("/lands/pending", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    // ✅ Correctly populate owner details
    const lands = await Land.find({ isApproved: false, rejectionReason: null }).populate('owner', 'name email');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ GET APPROVED LANDS (ADMIN ONLY)
 * Fetches all lands that have been approved.
 */
router.get("/lands/approved", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    // ✅ Correctly populate owner details
    const lands = await Land.find({ isApproved: true }).populate('owner', 'name email');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ GET REJECTED LANDS (ADMIN ONLY)
 * Fetches lands that have isApproved: false AND a rejectionReason.
 */
router.get("/lands/rejected", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    // ✅ Correctly populate owner details
    const lands = await Land.find({ isApproved: false, rejectionReason: { $ne: null } }).populate('owner', 'name email');
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5️⃣ GET SPECIFIC LAND DETAILS (ADMIN ONLY)
 */
router.get("/lands/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    // ✅ Correctly populate owner details
    const land = await Land.findById(req.params.id).populate('owner', 'name email');
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6️⃣ APPROVE A LAND LISTING
 */
router.put("/lands/approve/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, rejectionReason: null },
      { new: true, runValidators: true }
    );
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json({ message: "Land approved successfully", land });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7️⃣ UNAPPROVE A LAND LISTING
 */
router.put("/lands/unapprove/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, rejectionReason: null },
      { new: true, runValidators: true }
    );
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json({ message: "Land status set to pending", land });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8️⃣ REJECT A LAND LISTING
 */
router.put("/lands/reject/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const land = await Land.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, rejectionReason: rejectionReason || 'No reason provided' },
      { new: true, runValidators: true }
    );
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json({ message: "Land rejected successfully", land });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 9️⃣ DELETE A LAND LISTING (ADMIN ONLY)
 */
router.delete("/lands/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json({ message: "Land deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;