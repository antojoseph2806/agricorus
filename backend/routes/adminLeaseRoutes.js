const express = require("express");
const router = express.Router();
const Lease = require("../models/Lease");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * Admin: Get all leases (optionally filter by status)
 * Example: /api/admin/leases?status=active
 */
router.get("/", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const leases = await Lease.find(filter)
      .populate("land", "title location landPhotos")
      .populate("farmer", "name email phone")
      .populate("owner", "name email phone");

    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Get a specific lease by ID
 */
router.get("/:leaseId", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId)
      .populate("land", "title location landPhotos")
      .populate("farmer", "name email phone")
      .populate("owner", "name email phone");

    if (!lease) return res.status(404).json({ error: "Lease not found" });

    res.json(lease);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Edit a lease (update details)
 */
router.put("/:leaseId", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const lease = await Lease.findByIdAndUpdate(
      req.params.leaseId,
      req.body,
      { new: true }
    )
      .populate("land")
      .populate("farmer")
      .populate("owner");

    if (!lease) return res.status(404).json({ error: "Lease not found" });

    res.json({ message: "Lease updated successfully", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Change lease status (accepted, cancelled, active, etc.)
 */
router.put("/:leaseId/status", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const lease = await Lease.findById(req.params.leaseId);
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    lease.status = status;
    await lease.save();

    res.json({ message: `Lease status updated to ${status}`, lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin: Delete a lease
 */
router.delete("/:leaseId", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const lease = await Lease.findByIdAndDelete(req.params.leaseId);

    if (!lease) return res.status(404).json({ error: "Lease not found" });

    res.json({ message: "Lease deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
