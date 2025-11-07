// routes/profileRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const jwt = require("jsonwebtoken"); // New import for JWT
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// ======================================================
// @desc   Authentication Middleware to protect routes
// ======================================================
const protect = (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user payload to the request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// =============== Multer Config ===============
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Use the user's ID from the token in the filename
    cb(
      null,
      `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage });

// ======================================================
// @desc   Get user profile by token
// @route  GET /api/profile
// ======================================================
router.get("/", protect, async (req, res) => {
  try {
    // Find user using the ID from the decoded token
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// @desc   Update user profile (with optional image upload)
// @route  PUT /api/profile
// ======================================================
router.put("/", protect, upload.single("profileImage"), async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    // Find user using the ID from the decoded token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// @desc   Delete user by token
// @route  DELETE /api/profile
// ======================================================
router.delete("/", protect, async (req, res) => {
  try {
    // Delete user using the ID from the decoded token
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================================================
// @desc   Get all users (for admin use)
// @route  GET /api/profile/all
// ======================================================
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;