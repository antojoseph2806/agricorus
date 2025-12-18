const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const VendorOTP = require("../models/VendorOTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Validation regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number starting with 6-9
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * @route   POST /api/vendors/register
 * @desc    Register Vendor
 */
router.post("/register", async (req, res) => {
  try {
    const { businessName, ownerName, email, phone, password, confirmPassword } = req.body;

    // Validation: Required fields
    if (!businessName || !ownerName || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Validation: Email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address" 
      });
    }

    // Validation: Phone format (Indian 10-digit)
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid 10-digit Indian phone number" 
      });
    }

    // Validation: Password strength
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)" 
      });
    }

    // Validation: Password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Validation: Business name length
    if (businessName.trim().length < 2 || businessName.trim().length > 100) {
      return res.status(400).json({ 
        success: false,
        message: "Business name must be between 2 and 100 characters" 
      });
    }

    // Validation: Owner name length
    if (ownerName.trim().length < 2 || ownerName.trim().length > 50) {
      return res.status(400).json({ 
        success: false,
        message: "Owner name must be between 2 and 50 characters" 
      });
    }

    // Check existing vendor by email
    const existingVendorByEmail = await Vendor.findOne({ email: email.toLowerCase() });
    if (existingVendorByEmail) {
      return res.status(400).json({ 
        success: false,
        message: "Email already registered" 
      });
    }

    // Check existing vendor by phone
    const existingVendorByPhone = await Vendor.findOne({ phone });
    if (existingVendorByPhone) {
      return res.status(400).json({ 
        success: false,
        message: "Phone number already registered" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create vendor
    const vendor = await Vendor.create({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      kycStatus: "Pending",
      role: "vendor"
    });

    res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      vendorId: vendor._id
    });

  } catch (error) {
    console.error("Vendor registration error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Server error. Please try again." 
    });
  }
});

/**
 * @route   POST /api/vendors/login
 * @desc    Vendor Login
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address" 
      });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: vendor._id,
        role: vendor.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        kycStatus: vendor.kycStatus
      }
    });

  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Server error. Please try again." 
    });
  }
});

/**
 * @route   POST /api/vendors/forgot-password
 * @desc    Send OTP to vendor email for password reset
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address" 
      });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      // Don't reveal if email exists for security
      return res.status(200).json({ 
        success: true,
        message: "If the email exists, an OTP has been sent" 
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP (delete old OTPs for this email first)
    await VendorOTP.deleteMany({ email: email.toLowerCase() });
    await VendorOTP.create({ 
      email: email.toLowerCase(), 
      otp 
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - AgriCorus Vendor Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Password Reset Request</h2>
          <p>Hello ${vendor.businessName},</p>
          <p>You have requested to reset your password. Use the OTP below to proceed:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #16a34a; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">© AgriCorus - Agri Marketplace Platform</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to send OTP. Please try again." 
    });
  }
});

/**
 * @route   POST /api/vendors/verify-otp
 * @desc    Verify OTP for password reset
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    // Find OTP record
    const otpRecord = await VendorOTP.findOne({ 
      email: email.toLowerCase(),
      otp: otp 
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to verify OTP. Please try again." 
    });
  }
});

/**
 * @route   POST /api/vendors/reset-password
 * @desc    Reset password after OTP verification
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Validation: Password strength
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)" 
      });
    }

    // Validation: Password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // Verify OTP
    const otpRecord = await VendorOTP.findOne({ 
      email: email.toLowerCase(),
      otp: otp 
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: "Vendor not found" 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    vendor.password = hashedPassword;
    await vendor.save();

    // Delete OTP record
    await VendorOTP.deleteMany({ email: email.toLowerCase() });

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to reset password. Please try again." 
    });
  }
});

module.exports = router;
