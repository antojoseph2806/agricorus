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
    const lease = await Lease.findById(req.params.leaseId)
      .populate('land', 'title location')
      .populate('farmer', 'name email')
      .populate('owner', 'name email');

    if (!lease) return res.status(404).json({ error: "Lease not found" });

    // ✅ Only farmer or owner can view
    if (
      lease.farmer._id.toString() !== req.user.id &&
      lease.owner._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // If agreement doesn't exist but lease is active, generate it
    if (!lease.agreementUrl && lease.status === "active") {
      try {
        console.log("🔄 Generating missing agreement for lease:", lease._id);
        
        const generateLeasePDF = require('../utils/generateLeasePDF');
        const cloudinary = require('cloudinary').v2;
        
        const pdfPath = await generateLeasePDF(lease);
        
        const uploadResult = await cloudinary.uploader.upload(pdfPath, {
          folder: "agreements",
          resource_type: "raw",
        });
        
        lease.agreementUrl = uploadResult.secure_url;
        await lease.save();
        
        console.log("✅ Agreement generated successfully:", uploadResult.secure_url);
      } catch (generateError) {
        console.error("❌ Error generating agreement:", generateError);
        return res.status(500).json({ 
          error: "Failed to generate agreement. Please contact support.",
          details: generateError.message 
        });
      }
    }

    if (!lease.agreementUrl) {
      return res.status(404).json({ 
        error: "Agreement not available for this lease.",
        leaseStatus: lease.status,
        message: lease.status === "active" 
          ? "Agreement generation failed. Please contact support." 
          : "Agreement will be generated when the lease becomes active."
      });
    }

    // Send download response
    res.download(lease.agreementUrl, `Lease_Agreement_${lease._id}.pdf`);
  } catch (err) {
    console.error("❌ Error accessing agreement:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Admin or system route to regenerate agreement for a lease
 */
router.post("/:leaseId/regenerate-agreement", auth, async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId)
      .populate('land', 'title location')
      .populate('farmer', 'name email')
      .populate('owner', 'name email');

    if (!lease) return res.status(404).json({ error: "Lease not found" });

    // ✅ Only farmer, owner, or admin can regenerate
    if (
      lease.farmer._id.toString() !== req.user.id &&
      lease.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (lease.status !== "active") {
      return res.status(400).json({ 
        error: "Can only generate agreements for active leases",
        currentStatus: lease.status 
      });
    }

    const generateLeasePDF = require('../utils/generateLeasePDF');
    const cloudinary = require('cloudinary').v2;
    
    console.log("🔄 Regenerating agreement for lease:", lease._id);
    
    const pdfPath = await generateLeasePDF(lease);
    
    const uploadResult = await cloudinary.uploader.upload(pdfPath, {
      folder: "agreements",
      resource_type: "raw",
    });
    
    lease.agreementUrl = uploadResult.secure_url;
    await lease.save();
    
    console.log("✅ Agreement regenerated successfully:", uploadResult.secure_url);
    
    res.json({
      message: "Agreement regenerated successfully",
      agreementUrl: lease.agreementUrl,
      leaseId: lease._id
    });
  } catch (err) {
    console.error("❌ Error regenerating agreement:", err);
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
