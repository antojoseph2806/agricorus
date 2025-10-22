// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =======================
// EMAIL TRANSPORT CONFIG
// =======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Regex validations
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;

// =======================
// REGISTER (with OTP email)
// =======================
router.post("/register", async (req, res) => {
  const { name, email, phone, password, confirmPassword, role } = req.body;

  if (!name || !email || !phone || !password || !confirmPassword || !role)
    return res.status(400).json({ msg: "Please fill all fields" });

  if (!emailRegex.test(email))
    return res.status(400).json({ msg: "Invalid email format" });

  if (!phoneRegex.test(phone))
    return res.status(400).json({ msg: "Phone number must be 10 digits" });

  const allowedRoles = ["landowner", "farmer", "investor", "admin"];
  if (!allowedRoles.includes(role))
    return res.status(400).json({ msg: "Invalid role selected" });

  if (!passwordRegex.test(password))
    return res.status(400).json({
      msg: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });

  if (password !== confirmPassword)
    return res.status(400).json({ msg: "Passwords must match" });

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ msg: "Email already registered" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ msg: "Phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    // Save user (unverified)
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      otp: hashedOtp,
      otpExpires,
      isVerified: false,
    });
    await user.save();

    // ✅ Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <p>Hello ${name},</p>
        <p>Your OTP code is <b>${otp}</b>.</p>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      msg: "Registration successful. Please verify OTP sent to your email.",
      email: user.email,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// =======================
// VERIFY OTP
// =======================
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ msg: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.otp || !user.otpExpires)
      return res.status(400).json({ msg: "No OTP request found" });

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ msg: "OTP has expired" });

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) return res.status(400).json({ msg: "Invalid OTP" });

    // ✅ Mark verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      msg: "OTP verified successfully",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// =======================
// LOGIN (Email / Password)
// =======================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Please enter all fields" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(401)
        .json({ msg: "Please verify your email before logging in" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// =======================
// GOOGLE LOGIN
// =======================
router.post("/google", async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) return res.status(400).json({ msg: "Token is required" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    if (!email) return res.status(400).json({ msg: "Invalid Google token" });

    let user = await User.findOne({ email });

    // New Google user
    if (!user) {
      const hashedPassword = await bcrypt.hash(googleId, 12);

      user = new User({
        email,
        password: hashedPassword,
        isVerified: true, // Google users are already verified
      });

      await user.save();
    }

    // If role not set, frontend must complete registration
    if (!user.role) {
      return res.status(200).json({
        newUser: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      newUser: false,
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ msg: "Google login failed" });
  }
});

// =======================
// COMPLETE GOOGLE REGISTRATION
// =======================
router.post("/google/complete-registration", async (req, res) => {
  const { email, role, phone } = req.body;

  if (!email || !role)
    return res.status(400).json({ msg: "Missing required fields" });

  if (!["landowner", "farmer", "investor"].includes(role))
    return res.status(400).json({ msg: "Invalid role selected" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (phone && typeof phone === "string" && phone.trim() !== "") {
      const existingPhone = await User.findOne({ phone });
      if (
        existingPhone &&
        existingPhone._id.toString() !== user._id.toString()
      ) {
        return res.status(400).json({ msg: "Phone already registered" });
      }
      user.phone = phone.trim();
    }

    user.role = role;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Complete registration error:", error);
    res.status(500).json({ msg: "Failed to complete registration" });
  }
});

module.exports = router;
