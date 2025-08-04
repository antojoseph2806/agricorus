const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =======================
// REGISTER (Email / Phone / Password)
// =======================
router.post('/register', async (req, res) => {
  const { email, phone, password, confirmPassword, role } = req.body;

  if (!email || !phone || !password || !confirmPassword || !role) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }

  if (!['landowner', 'farmer', 'investor', 'admin'].includes(role)) {
    return res.status(400).json({ msg: 'Invalid role selected' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords must match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password should be at least 6 characters' });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ msg: 'Email already registered' });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ msg: 'Phone already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ email, phone, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
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
