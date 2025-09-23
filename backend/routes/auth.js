const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Email regex: basic RFC compliant
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Phone regex: allows only 10 digits (adjust for your region if needed)
const phoneRegex = /^[0-9]{10}$/;

// ✅ Strong password: min 8 chars, uppercase, lowercase, number, special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
// =======================
// REGISTER
// =======================
router.post("/register", async (req, res) => {
  const { name, email, phone, password, confirmPassword, role } = req.body;

  // 1️⃣ Check empty fields
  if (!name || !email || !phone || !password || !confirmPassword || !role) {
    return res.status(400).json({ msg: "Please fill all fields" });
  }

  // 2️⃣ Validate email format
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: "Invalid email format" });
  }

  // 3️⃣ Validate phone format
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ msg: "Phone number must be 10 digits" });
  }

  // 4️⃣ Validate role
  const allowedRoles = ["landowner", "farmer", "investor", "admin"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ msg: "Invalid role selected" });
  }

  // 5️⃣ Validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      msg: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });
  }

  // 6️⃣ Check password confirmation
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords must match" });
  }

  try {
    // 7️⃣ Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // 8️⃣ Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ msg: "Phone already registered" });
    }

    // 9️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔟 Save new user
    const user = new User({ name, email, phone, password: hashedPassword, role });
    await user.save();

    // 1️⃣1️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 1️⃣2️⃣ Send response
    res.status(201).json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// =======================
// LOGIN (Email / Password)
// =======================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: 'Please enter all fields' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// =======================
// GOOGLE LOGIN (First-Time or Existing)
// =======================
router.post('/google', async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) return res.status(400).json({ msg: 'Token is required' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    if (!email) return res.status(400).json({ msg: 'Invalid Google token' });

    let user = await User.findOne({ email });

    // First-time Google login
    if (!user) {
      const hashedPassword = await bcrypt.hash(googleId, 12);

      user = new User({
        email,
        password: hashedPassword,
        // No phone or role yet
      });

      await user.save();
    }

    // Ask frontend to show phone + role modal if not set
    if (!user.role) {
      return res.status(200).json({
        newUser: true,
        email: user.email,
      });
    }

    // Existing user — login
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      newUser: false,
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ msg: 'Google login failed' });
  }
});

// =======================
// COMPLETE REGISTRATION (Google Users Only)
// =======================
router.post('/google/complete-registration', async (req, res) => {
  const { email, role, phone } = req.body;

  if (!email || !role) return res.status(400).json({ msg: 'Missing required fields' });

  if (!['landowner', 'farmer', 'investor'].includes(role)) {
    return res.status(400).json({ msg: 'Invalid role selected' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // If phone is provided, validate and check duplicate
    if (phone && typeof phone === 'string' && phone.trim() !== '') {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone && existingPhone._id.toString() !== user._id.toString()) {
        return res.status(400).json({ msg: 'Phone already registered' });
      }

      user.phone = phone.trim();
    }

    user.role = role;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ msg: 'Failed to complete registration' });
  }
});

module.exports = router;
