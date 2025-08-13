const express = require("express");
const router = express.Router();
const Lease = require("../models/Lease");
const Land = require("../models/Land");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const generateLeasePDF = require("../utils/generateLeasePDF");
const cloudinary = require("cloudinary").v2; // ✅ Added missing import

// Farmer requests a lease
router.post("/:landId/request", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const land = await Land.findById(req.params.landId);
    if (!land) return res.status(404).json({ error: "Land not found" });
    if (land.status !== "available") return res.status(400).json({ error: "Land is not available" });

    const lease = new Lease({
      land: land._id,
      farmer: req.user.id,
      owner: land.owner,
      durationMonths: req.body.durationMonths || land.leaseDurationMonths,
      pricePerMonth: land.leasePricePerMonth
    });

    await lease.save();
    res.status(201).json({ message: "Lease request submitted", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all lease requests for landowner's lands
router.get("/owner/requests", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const leases = await Lease.find({ owner: req.user.id })
      .populate("land")
      .populate("farmer", "name email");
    res.json(leases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve lease request
router.put("/:leaseId/approve", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, owner: req.user.id })
      .populate("land")
      .populate("farmer")
      .populate("owner");
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    lease.status = "approved";
    await lease.save();

    // Update land status
    await Land.findByIdAndUpdate(lease.land._id, { status: "leased" });

    // Generate PDF
    const pdfPath = await generateLeasePDF(lease, lease.land, lease.farmer, lease.owner);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(pdfPath, {
      folder: "agricorus/agreements",
      resource_type: "raw"
    });

    // Save agreement URL in lease
    lease.agreementUrl = uploadResult.secure_url;
    await lease.save();

    res.json({ message: "Lease approved and agreement generated", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject lease request
router.put("/:leaseId/reject", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, owner: req.user.id });
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    lease.status = "rejected";
    await lease.save();

    res.json({ message: "Lease rejected", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ Export router so server.js can use it
