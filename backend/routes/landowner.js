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
  upload = require("../middleware/upload"); // Ensure this imports the Cloudinary middleware
} catch (err) {
  console.warn("⚠️ upload middleware not found — skipping file handling");
  upload = {
    fields: () => (req, res, next) => next(),
    array: () => (req, res, next) => next(),
  };
}

/**
 * 1️⃣ CREATE LAND LISTING
 */
router.post(
  "/lands",
  auth,
  authorizeRoles("landowner"),
  upload.fields([
    { name: "landPhotos", maxCount: 5 },
    { name: "landDocuments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      // ⭐ Step 1: Check if files were processed by Multer
      if (!req.files) {
        // This will now only trigger if the upload middleware is completely broken,
        // not if no files were selected. Multer will still process the request.
        return res.status(400).json({ error: "No files received. Check your middleware configuration." });
      }

      // ⭐ Step 2: Log the received data to see if it's correct
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
      console.log('Received files:', JSON.stringify(req.files, null, 2));

      // Extract photo and document URLs from the uploaded files
      const landPhotoUrls = req.files.landPhotos?.map(f => f.path) || [];
      const landDocumentUrls = req.files.landDocuments?.map(f => f.path) || [];

      // Destructure and validate required fields from the request body
      const {
        title,
        soilType,
        waterSource,
        accessibility,
        sizeInAcres,
        leasePricePerMonth,
        leaseDurationMonths,
        location_address,
        location_latitude,
        location_longitude
      } = req.body;

      // Reconstruct the nested location object from flat keys
      const location = {
        address: location_address,
        latitude: location_latitude,
        longitude: location_longitude,
      };

      const land = new Land({
        title,
        soilType,
        waterSource,
        accessibility,
        sizeInAcres,
        leasePricePerMonth,
        leaseDurationMonths,
        location,
        landPhotos: landPhotoUrls,
        landDocuments: landDocumentUrls,
        owner: req.user?.id || null,
        isApproved: false,
      });

      await land.save();
      res.status(201).json({
        message: "✅ Land listed successfully, awaiting admin approval",
        land: land.toJSON(),
      });
    } catch (err) {
      // ⭐ Step 3: Log the detailed error message for better debugging
      console.error("❌ CREATE LAND ERROR:", err.message);
      console.error("❌ STACK TRACE:", err.stack);
      // Return a 400 error for validation issues or 500 for server issues
      const statusCode = err.name === 'ValidationError' ? 400 : 500;
      res.status(statusCode).json({ error: err.message });
    }
  }
);

/**
 * 2️⃣ GET ALL APPROVED LANDS (PUBLIC)
 */
router.get("/lands", async (req, res) => {
  try {
    const lands = await Land.find({ isApproved: true, status: "available" }).lean();
    res.json(lands);
  } catch (err) {
    console.error("❌ GET LANDS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ GET MY LANDS (LANDOWNER)
 */
router.get("/lands/my", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user?.id || null }).lean();
    res.json(lands);
  } catch (err) {
    console.error("❌ GET MY LANDS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ GET SINGLE LAND (OWNER VIEW)
 */
router.get("/lands/:id", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const land = await Land.findOne({ _id: req.params.id, owner: req.user?.id || null })
      .populate("owner", "name email")
      .lean();

    if (!land) return res.status(404).json({ error: "Land not found" });
    res.json(land);
  } catch (err) {
    console.error("❌ GET SINGLE LAND ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5️⃣ PUBLIC GET SINGLE APPROVED LAND
 */
router.get("/lands/public/:id", async (req, res) => {
  try {
    const land = await Land.findOne({ _id: req.params.id, isApproved: true }).lean();
    if (!land) return res.status(404).json({ error: "Approved land not found" });
    res.json(land);
  } catch (err) {
    console.error("❌ GET PUBLIC LAND ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6️⃣ UPDATE LAND
 */
router.put(
  "/lands/:id",
  auth,
  authorizeRoles("landowner"),
  upload.fields([
    { name: "landPhotos", maxCount: 5 },
    { name: "landDocuments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        soilType,
        waterSource,
        accessibility,
        sizeInAcres,
        leasePricePerMonth,
        leaseDurationMonths,
        location_address,
        location_latitude,
        location_longitude
      } = req.body;
      
      const updateData = {
        title,
        soilType,
        waterSource,
        accessibility,
        sizeInAcres,
        leasePricePerMonth,
        leaseDurationMonths,
      };
      
      // Handle nested location object
      if (location_address && location_latitude && location_longitude) {
        updateData.location = {
          address: location_address,
          latitude: location_latitude,
          longitude: location_longitude,
        };
      }

      // Handle file updates using $push
      if (req.files) {
        if (req.files.landPhotos && req.files.landPhotos.length > 0) {
          const landPhotoUrls = req.files.landPhotos.map(f => f.path);
          updateData.$push = { ...updateData.$push, landPhotos: { $each: landPhotoUrls } };
        }
        if (req.files.landDocuments && req.files.landDocuments.length > 0) {
          const landDocumentUrls = req.files.landDocuments.map(f => f.path);
          updateData.$push = { ...updateData.$push, landDocuments: { $each: landDocumentUrls } };
        }
      }

      const land = await Land.findOneAndUpdate(
        { _id: req.params.id, owner: req.user?.id || null },
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!land) return res.status(404).json({ error: "Land not found" });
      res.json({ message: "✅ Land updated", land });
    } catch (err) {
      console.error("❌ UPDATE LAND ERROR:", err);
      const statusCode = err.name === 'ValidationError' ? 400 : 500;
      res.status(statusCode).json({ error: err.message });
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
    res.json({ message: "🗑️ Land deleted" });
  } catch (err) {
    console.error("❌ DELETE LAND ERROR:", err);
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

    res.json({ message: "✅ Release request sent to admin", payment: payment.toJSON() });
  } catch (err) {
    console.error("❌ REQUEST RELEASE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;