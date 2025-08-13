const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Lease = require("../models/Lease");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

/**
 * 1️⃣ Farmer pays lease amount into escrow
 */
router.post("/:leaseId/pay", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.leaseId);
    if (!lease) return res.status(404).json({ error: "Lease not found" });
    if (lease.status !== "approved") return res.status(400).json({ error: "Lease is not approved yet" });

    // In real production: integrate payment gateway here
    const amount = lease.pricePerMonth * lease.durationMonths;

    const payment = new Payment({
      lease: lease._id,
      payer: req.user.id,
      payee: lease.owner,
      amount: amount,
      status: "escrow"
    });

    await payment.save();
    res.status(201).json({ message: "Payment held in escrow", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3️⃣ Landowner requests payment release from escrow
 */
router.post("/:paymentId/request-release", auth, authorizeRoles("landowner"), async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.paymentId, payee: req.user.id });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "escrow") return res.status(400).json({ error: "Payment not in escrow" });

    payment.releaseRequested = true;
    await payment.save();

    res.json({ message: "Release request sent to admin", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4️⃣ Admin approves release to landowner
 */
router.put("/:paymentId/release", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status !== "escrow") return res.status(400).json({ error: "Payment already released/refunded" });

    // In real system: trigger payout to landowner via payment gateway

    payment.status = "released";
    payment.releaseRequested = false;
    await payment.save();

    res.json({ message: "Escrow released to landowner", payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
