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
  upload = { array: () => (req, res, next) => next() };
}

/**
 * 1️⃣ CREATE LAND LISTING (FILES via form-data)
 */
router.post(
  "/lands",
  auth,
  authorizeRoles("landowner"),
  upload.array("documents", 5),
  async (req, res) => {
    try {
      const fileUrls = req.files?.map(file => file.path) || [];
      const land = new Land({
        ...req.body,
        documents: fileUrls,
        owner: req.user?.id || null,
        isApproved: false // ✅ New: Default to false, awaiting admin approval
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
 * This route is now public and can be accessed without a role.
 * It will only return lands that are approved and available.
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
 * This route is for the landowner's personal view, so it shows all their lands.
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
 * ✅ 4️⃣ GET SINGLE LAND (LANDOWNER'S PERSONAL VIEW)
 * This route remains protected for the landowner to view their own lands.
 * Note: I removed the extra comma in the route path.
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
 * ✅ 5️⃣ NEW PUBLIC ROUTE FOR VIEWING A SPECIFIC APPROVED LAND
 * This route is accessible to all users (landowners, farmers, etc.) without authentication.
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
 */
router.put(
  "/lands/:id",
  auth,
  authorizeRoles("landowner"),
  upload.array("documents", 5),
  async (req, res) => {
    try {
      let updateData = { ...req.body };
      if (req.files && req.files.length > 0) {
        const fileUrls = req.files.map(file => file.path);
        updateData.$push = { documents: { $each: fileUrls } };
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