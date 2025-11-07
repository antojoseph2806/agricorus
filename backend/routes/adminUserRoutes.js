const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

/* ============================
   ADMIN USER MANAGEMENT (CRUD)
   ============================ */

// 👉 Get all users
router.get("/", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 👉 Get single user by ID
router.get("/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 👉 Create new user (Admin can add user directly)
router.post("/", auth, authorizeRoles("admin"), async (req, res) => {
  const { email, phone, password, role } = req.body;

  if (!email || !phone || !password || !role) {
    return res.status(400).json({ msg: "Please provide all fields" });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: "Email already exists" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ msg: "Phone already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ email, phone, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({
      msg: "User created successfully",
      user: { id: newUser._id, email: newUser.email, phone: newUser.phone, role: newUser.role }
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 👉 Update user (role, phone, etc.)
router.put("/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const updates = req.body;

    // Prevent password overwrite directly
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 👉 Delete user
router.delete("/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 👉 Block user
router.put("/:id/block", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User blocked successfully", user });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// 👉 Unblock user
router.put("/:id/unblock", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User unblocked successfully", user });
  } catch (err) {
    console.error("Unblock user error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
// 👉 Get users by role (landowners, farmers, investors)
router.get("/role/:role", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { role } = req.params;

    // Only allow valid roles
    const allowedRoles = ["landowner", "farmer", "investor"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ msg: "Invalid role type" });
    }

    const users = await User.find({ role }).select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ msg: `No ${role}s found` });
    }

    res.json({
      msg: `${role.charAt(0).toUpperCase() + role.slice(1)}s fetched successfully`,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Get users by role error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
