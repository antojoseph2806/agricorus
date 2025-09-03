const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const Lease = require("../models/Lease");
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // from Razorpay Dashboard
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * 1️⃣ Create Razorpay Order
 * Endpoint: POST /api/payments/order/:leaseId
 */
router.post("/order/:leaseId", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lease = await Lease.findOne({
      _id: req.params.leaseId,
      farmer: req.user.id,
      status: "accepted",
    }).populate("land");

    if (!lease) {
      return res.status(404).json({ error: "Lease not found or not eligible for payment." });
    }

    // 🔹 Create a short, unique receipt (<= 40 chars for Razorpay)
    const shortId = lease._id.toString().slice(-6);
    const receipt = `lease_${shortId}_${Date.now().toString().slice(-6)}`;

    const options = {
      amount: lease.pricePerMonth * 100, // convert ₹ to paise
      currency: "INR",
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      leaseId: lease._id,
      key: process.env.RAZORPAY_KEY_ID, // send key_id to client
    });
  } catch (err) {
    console.error("❌ Error creating Razorpay order:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2️⃣ Verify Razorpay Payment
 * Endpoint: POST /api/payments/verify
 */
router.post("/verify", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leaseId } = req.body;

    // 🔐 Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature." });
    }

    // ✅ Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    // Find lease
    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json({ error: "Lease not found." });

    // 🔹 Map Razorpay status → app status
    let status = "pending";
    if (paymentDetails.status === "captured") status = "success";
    else if (paymentDetails.status === "failed") status = "failed";

    // Save payment record
    const payment = new Payment({
      lease: lease._id,
      farmer: req.user.id,
      owner: lease.owner,
      land: lease.land,
      amount: lease.pricePerMonth,
      method: paymentDetails.method, // "upi", "card", etc.
      status, // ✅ mapped to success/failed/pending
      paidAt: new Date(),
      transactionId: razorpay_payment_id,
    });

    await payment.save();

    // Update lease status → active (make sure Lease schema has "active")
    lease.status = "active";
    await lease.save();

    res.json({ message: "Payment verified successfully", payment });
  } catch (err) {
    console.error("❌ Error verifying payment:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
