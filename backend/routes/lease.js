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
 * This route is correctly implemented to filter by the landowner's ID.
 * The frontend will handle displaying 'all', 'pending', 'accepted', etc.
 */
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

//----------------------------------------------------------------

/**
 * Landowner accepts a lease request.
 * This is a preliminary acceptance. The status changes to 'accepted',
 * but the finalApproval field remains 'pending' for the admin.
 */
router.put("/:leaseId/accept", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, owner: req.user.id })
      .populate("land")
      .populate("farmer")
      .populate("owner");
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    // Update lease status to 'accepted' but keep finalApproval as 'pending'
    lease.status = "accepted";
    await lease.save();

    res.json({ message: "Lease accepted by landowner, pending admin approval.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//----------------------------------------------------------------

/**
 * Landowner rejects a lease request.
 * This permanently sets the status to 'rejected'.
 */
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

//----------------------------------------------------------------

/**
 * NEW ROUTE: Admin makes the final approval.
 * This route is for admin only. It changes the land status to 'leased'
 * and generates the official agreement.
 */
router.put("/:leaseId/final-approve", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId)
      .populate("land")
      .populate("farmer")
      .populate("owner");
      
    if (!lease) return res.status(404).json({ error: "Lease not found" });
    if (lease.status !== "accepted") {
      return res.status(400).json({ error: "Lease must be accepted by landowner before final approval." });
    }

    // Set final approval status
    lease.finalApproval = "approved";
    await lease.save();

    // Update land status to 'leased' and generate agreement only on final approval
    await Land.findByIdAndUpdate(lease.land._id, { status: "leased" });
    const pdfPath = await generateLeasePDF(lease, lease.land, lease.farmer, lease.owner);
    const uploadResult = await cloudinary.uploader.upload(pdfPath, {
      folder: "agricorus/agreements",
      resource_type: "raw"
    });
    lease.agreementUrl = uploadResult.secure_url;
    await lease.save();

    res.json({ message: "Lease officially approved by admin and land is now leased.", lease });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;