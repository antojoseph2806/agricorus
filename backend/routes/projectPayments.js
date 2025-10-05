const express = require("express");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const Project = require("../models/Project");
const Investment = require("../models/Investment");

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ------------------------
// Create Razorpay order
// ------------------------
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, projectId } = req.body;
    if (!amount || !projectId) {
      return res.status(400).json({ message: "Amount and projectId required" });
    }

    // Validate user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "open") return res.status(400).json({ message: "Project is not open for investment" });

    const remaining = project.fundingGoal - project.currentFunding;

    // Validations
    if (amount < 2000) return res.status(400).json({ message: "Minimum investment is ₹2000" });
    if (amount % 500 !== 0) return res.status(400).json({ message: "Investment must be in multiples of ₹500" });
    if (amount > remaining) return res.status(400).json({ message: `Cannot exceed remaining funding: ₹${remaining}` });

    // Safe receipt for Razorpay (max 40 chars)
    const receipt = `invest_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt,
    });

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// ------------------------
// Verify payment & update funding
// ------------------------
router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, projectId, amount } = req.body;

    // Validate input
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !projectId || !amount) {
      return res.status(400).json({ message: "Missing required payment info" });
    }

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== "open") return res.status(400).json({ message: "Project is not open for investment" });

    const remaining = project.fundingGoal - project.currentFunding;
    if (amount > remaining) return res.status(400).json({ message: "Investment exceeds remaining funding" });

    // Atomic update to prevent race conditions
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, currentFunding: { $lte: remaining } },
      { $inc: { currentFunding: amount } },
      { new: true }
    );

    if (!updatedProject) return res.status(400).json({ message: "Investment exceeds funding goal" });

    // Update project status if funded
    if (updatedProject.currentFunding >= updatedProject.fundingGoal) {
      updatedProject.status = "funded";
      await updatedProject.save();
    }

    // Save investment record
    const investment = new Investment({
      investorId: req.user._id,
      projectId,
      amount,
      paymentId: razorpay_payment_id,
    });

    await investment.save();

    res.json({ message: "Payment verified and project funding updated", investment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// ------------------------
// Get investment history
// ------------------------
router.get("/investments/history", auth, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const investments = await Investment.find({ investorId: req.user._id })
      .populate("projectId", "title fundingGoal currentFunding status")
      .sort({ createdAt: -1 });

    res.json({ investments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch investment history", error: err.message });
  }
});

module.exports = router;
