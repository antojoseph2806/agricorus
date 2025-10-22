const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls
      default: null,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["landowner", "farmer", "investor", "admin"],
      default: null,
    },

    profileImage: {
      type: String,
      default: null, // store URL of uploaded image
    },

    joined: {
      type: Date,
      default: Date.now, // auto-set join date
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    // ✅ OTP fields for verification
    otp: {
      type: String,
      default: null, // store hashed OTP (never store plain OTP)
    },

    otpExpires: {
      type: Date,
      default: null, // OTP expiry timestamp
    },

    isVerified: {
      type: Boolean,
      default: false, // true after successful OTP verification
    },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

module.exports = mongoose.model("User", userSchema);
