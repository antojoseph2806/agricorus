// routes/landowner.js
const express = require("express");
const router = express.Router();
const Land = require("../models/Land");
const Payment = require("../models/Payment");

// Middlewares
let auth, authorizeRoles, upload;
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
try {
  upload = require("../middleware/upload");
} catch (err) {
  console.warn("⚠️ upload middleware not found — skipping file handling");
  // Assuming upload.fields is available
  upload = { fields: () => (req, res, next) => next(), array: () => (req, res, next) => next() };
}

/**
 * 1️⃣ CREATE LAND LISTING (FILES via form-data)
 * Now handles two file fields: 'landPhotos' and 'landDocuments'
 */
router.post(
  "/lands",
  auth,
  authorizeRoles("landowner"),
  // ✅ Use upload.fields() to handle multiple file fields
  upload.fields([
    { name: 'landPhotos', maxCount: 5 },
    { name: 'landDocuments', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const landPhotoUrls = req.files?.landPhotos?.map(file => file.path) || [];
      const landDocumentUrls = req.files?.landDocuments?.map(file => file.path) || [];
      
      const land = new Land({
        ...req.body,
        landPhotos: landPhotoUrls, // ✅ Save photos separately
        landDocuments: landDocumentUrls, // ✅ Save documents separately
        owner: req.user?.id || null,
        isApproved: false 
      });
      await land.save();
      res.status(201).json({ message: "Land listed successfully, awaiting admin approval", land });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 2️⃣ GET ALL APPROVED LANDS (PUBLIC ROUTE)
 */
router.get("/lands", async (req, res) => {
  try {
    const lands = await Land.find({ isApproved: true, status: 'available' });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ GET LOGGED-IN LANDOWNER’S LANDS
 */
router.get("/lands/my", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user?.id || null });
    res.json(lands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ GET SINGLE LAND (LANDOWNER'S PERSONAL VIEW)
 */
router.get("/lands/:id", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const land = await Land.findOne({ _id: req.params.id, owner: req.user?.id || null }).populate('owner', 'name email');
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5️⃣ NEW PUBLIC ROUTE FOR VIEWING A SPECIFIC APPROVED LAND
 */
router.get("/lands/public/:id", async (req, res) => {
  try {
    const land = await Land.findOne({ _id: req.params.id, isApproved: true });
    if (!land) return res.status(404).json({ error: "Approved land not found" });
    res.json(land);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6️⃣ UPDATE LAND
 * Now handles two separate file fields: 'landPhotos' and 'landDocuments'
 */
router.put(
  "/lands/:id",
  auth,
  authorizeRoles("landowner"),
  // ✅ Use upload.fields() to handle multiple file fields for updates
  upload.fields([
    { name: 'landPhotos', maxCount: 5 },
    { name: 'landDocuments', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      let updateData = { ...req.body };
      
      // Handle new photos
      if (req.files && req.files.landPhotos && req.files.landPhotos.length > 0) {
        const landPhotoUrls = req.files.landPhotos.map(file => file.path);
        updateData.$push = { landPhotos: { $each: landPhotoUrls } };
      }

      // Handle new documents
      if (req.files && req.files.landDocuments && req.files.landDocuments.length > 0) {
        const landDocumentUrls = req.files.landDocuments.map(file => file.path);
        if (updateData.$push) {
          updateData.$push.landDocuments = { $each: landDocumentUrls };
        } else {
          updateData.$push = { landDocuments: { $each: landDocumentUrls } };
        }
      }

      const land = await Land.findOneAndUpdate(
        { _id: req.params.id, owner: req.user?.id || null },
        updateData,
        { new: true }
      );
      if (!land) return res.status(404).json({ error: "Land not found" });
      res.json({ message: "Land updated", land });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 7️⃣ DELETE LAND
 */
router.delete("/lands/:id", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const land = await Land.findOneAndDelete({ _id: req.params.id, owner: req.user?.id || null });
    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json({ message: "Land deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 8️⃣ REQUEST PAYMENT RELEASE
 */
router.post("/:paymentId/request-release", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.paymentId, payee: req.user?.id || null });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "escrow") return res.status(400).json({ error: "Payment not in escrow" });

    payment.releaseRequested = true;
    await payment.save();

    res.json({ message: "Release request sent to admin", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;