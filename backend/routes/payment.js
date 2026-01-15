const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const Lease = require("../models/Lease");
const LeasePayment = require("../models/LeasePayment");
const PayoutMethod = require("../models/PayoutMethod");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const generateLeasePDF = require("../utils/generateLeasePDF");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order for next installment
 */
router.post("/order/:leaseId", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lease = await Lease.findOne({
      _id: req.params.leaseId,
      farmer: req.user.id,
    }).populate("land");

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.paymentsMade >= lease.totalPayments) {
      return res.status(400).json({ error: "All payments are already completed." });
    }

    const shortId = lease._id.toString().slice(-6);
    const receipt = `lease_${shortId}_${lease.paymentsMade + 1}_${Date.now().toString().slice(-6)}`;

    const options = {
      amount: lease.pricePerMonth * 100,
      currency: "INR",
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      leaseId: lease._id,
      key: process.env.RAZORPAY_KEY_ID,
      installmentNumber: lease.paymentsMade + 1,
      totalInstallments: lease.totalPayments,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Verify Razorpay Payment
 */
router.post("/verify", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leaseId } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature." });
    }

    // Fetch payment details
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    const lease = await Lease.findById(leaseId).populate("farmer owner land");
    if (!lease) return res.status(404).json({ error: "Lease not found." });

    // Map Razorpay status
    let status = "pending";
    if (paymentDetails.status === "captured") status = "success";
    else if (paymentDetails.status === "failed") status = "failed";

    // Save payment record using LeasePayment model
    const payment = new LeasePayment({
      lease: lease._id,
      farmer: req.user.id,
      owner: lease.owner._id,
      land: lease.land._id,
      amount: lease.pricePerMonth,
      method: paymentDetails.method || "razorpay",
      status,
      paidAt: new Date(),
      transactionId: razorpay_payment_id,
      installmentNumber: lease.paymentsMade + 1
    });

    await payment.save();

    // Update lease installment tracking
    if (status === "success") {
      lease.paymentsMade += 1;

      // First payment -> activate lease + generate agreement
      if (lease.status === "accepted") {
        lease.status = "active";

        if (!lease.agreementUrl) {
          try {
            const pdfPath = await generateLeasePDF(lease);
            const uploadResult = await cloudinary.uploader.upload(pdfPath, {
              folder: "agreements",
              resource_type: "raw",
            });
            lease.agreementUrl = uploadResult.secure_url;
          } catch (pdfErr) {
            console.error("Error generating PDF:", pdfErr);
          }
        }
      }

      // Last payment -> mark completed
      if (lease.paymentsMade >= lease.totalPayments) {
        lease.status = "completed";
      }

      await lease.save();
    }

    res.json({
      message: "Payment verified successfully",
      payment,
      leaseStatus: lease.status,
      paymentsMade: lease.paymentsMade,
      totalPayments: lease.totalPayments,
      agreementUrl: lease.agreementUrl,
    });
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * View Lease Payment History
 */
router.get("/history/:leaseId", auth, async (req, res) => {
  try {
    const { leaseId } = req.params;

    const lease = await Lease.findById(leaseId).populate("farmer owner land");
    if (!lease) return res.status(404).json({ error: "Lease not found." });

    // Role-based access
    if (req.user.role === "farmer" && lease.farmer._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to view this lease's payments." });
    }

    if (req.user.role === "landowner" && lease.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to view this lease's payments." });
    }

    // Fetch payments sorted by newest first
    const payments = await LeasePayment.find({ lease: leaseId })
      .populate("farmer", "name email")
      .populate("owner", "name email")
      .populate("land", "title location")
      .sort({ paidAt: -1 });

    res.json({
      leaseId: lease._id,
      leaseStatus: lease.status,
      paymentsMade: lease.paymentsMade,
      totalPayments: lease.totalPayments,
      landDetails: lease.land,
      history: payments,
    });
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ error: "An internal server error occurred while fetching payment history." });
  }
});

module.exports = router;
