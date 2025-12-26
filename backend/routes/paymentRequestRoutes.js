const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const PaymentRequest = require("../models/PaymentRequest"); // ✅ correct import
const Lease = require("../models/Lease");
const PayoutMethod = require("../models/PayoutMethod");
const authorizeRoles = require("../middleware/authorizeRoles");
const multer = require("multer");
const path = require("path");

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/payment-receipts/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, PNG) and PDF files are allowed"));
    }
  },
}); 

// Landowner can submit a request for lease payment
router.post("/request-payment/:leaseId", auth, async (req, res) => {
  try {
    const { leaseId } = req.params;
    const { payoutMethodId } = req.body;

    const lease = await Lease.findById(leaseId).populate("owner farmer land");
    if (!lease) return res.status(404).json({ error: "Lease not found." });

    if (req.user.role !== "landowner" || lease.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to request payment for this lease." });
    }

    if (lease.paymentsMade >= lease.totalPayments) {
      return res.status(400).json({ error: "All payments for this lease have already been made." });
    }

    if (!payoutMethodId) {
      return res.status(400).json({ error: "Please select a payout method (UPI or Bank)." });
    }

    const payoutMethod = await PayoutMethod.findOne({ _id: payoutMethodId, user: req.user.id });
    if (!payoutMethod) {
      return res.status(404).json({ error: "Selected payout method not found." });
    }

    // Prevent duplicate pending requests
    const existingRequest = await PaymentRequest.findOne({
      lease: lease._id,
      owner: req.user.id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        error: "A payment request for this lease is already pending. Please wait for it to be processed.",
      });
    }

    // Create payment request
    const monthlyAmount = lease.pricePerMonth;
    const paymentRequest = new PaymentRequest({
      lease: lease._id,
      farmer: lease.farmer._id,
      owner: lease.owner._id,
      land: lease.land,
      amount: monthlyAmount,
      status: "pending",
      requestedAt: new Date(),
      payoutMethod: payoutMethod._id,
    });

    await paymentRequest.save();

    res.status(201).json({
      message: `Payment request for ₹${monthlyAmount} submitted successfully.`,
      request: paymentRequest,
    });
  } catch (err) {
    console.error("❌ Error submitting payment request:", err);
    res.status(500).json({ error: "An internal server error occurred while submitting payment request." });
  }
});

// Landowner can view their submitted payment requests
router.get("/my-requests", auth, async (req, res) => {
  try {
    if (req.user.role !== "landowner") {
      return res
        .status(403)
        .json({ error: "Only landowners can view their payment requests." });
    }

    const requests = await PaymentRequest.find({ owner: req.user.id })
      .populate({
        path: "lease",
        select: "land farmer durationMonths pricePerMonth totalPayments paymentsMade status",
        populate: { path: "farmer", select: "name email phone" }, // populate farmer inside lease
      })
      .populate("farmer", "name email phone") // also populate the direct farmer reference
      .populate("payoutMethod", "type name upiId accountNumber ifscCode bankName isDefault");

    // Optional: ensure name fallback
    const formattedRequests = requests.map((req) => {
      const farmerName =
        req.farmer?.name ||
        req.lease?.farmer?.name ||
        req.farmer?.email ||
        "N/A";

      return {
        ...req._doc,
        farmer: {
          ...req.farmer?._doc,
          name: farmerName,
        },
      };
    });

    res.status(200).json({ count: formattedRequests.length, requests: formattedRequests });
  } catch (err) {
    console.error("❌ Error fetching payment requests:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching payment requests." });
  }
});

// Cancel a pending payment request
router.delete("/cancel-request/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the payment request
    const paymentRequest = await PaymentRequest.findById(requestId);
    if (!paymentRequest) {
      return res.status(404).json({ error: "Payment request not found." });
    }

    // Only the owner who submitted it can cancel
    if (paymentRequest.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to cancel this request." });
    }

    // Only pending requests can be canceled
    if (paymentRequest.status !== "pending") {
      return res.status(400).json({ error: "Only pending requests can be canceled." });
    }

    // Delete or mark as canceled
    paymentRequest.status = "canceled";
    paymentRequest.canceledAt = new Date();
    await paymentRequest.save();

    res.status(200).json({ message: "Payment request canceled successfully.", request: paymentRequest });
  } catch (err) {
    console.error("❌ Error canceling payment request:", err);
    res.status(500).json({ error: "An internal server error occurred while canceling the payment request." });
  }
});


router.post("/", auth, async (req, res) => {
  const { investmentId, payoutMethod } = req.body;

  if (!investmentId || !payoutMethod)
    return res.status(400).json({ message: "Missing fields" });

  const existing = await PaymentRequest.findOne({ investmentId });
  if (existing)
    return res.status(400).json({ message: "Request already exists for this investment" });

  const request = await PaymentRequest.create({
    investorId: req.user._id,
    investmentId,
    payoutMethod,
    status: "pending"
  });

  res.json({ success: true, message: "Return request submitted", request });
});
// =============================
// GET all payment requests (admin)
// =============================
router.get("/admin", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const requests = await PaymentRequest.find()
      .populate("owner", "name email")
      .populate("farmer", "name email phone")
      .populate("lease", "land pricePerMonth durationMonths status")
      .populate("payoutMethod", "type name upiId accountNumber ifscCode bankName");

    res.status(200).json({
      message: "All payment requests retrieved successfully.",
      paymentRequests: requests,
    });
  } catch (err) {
    console.error("❌ Error fetching payment requests:", err);
    res.status(500).json({ error: "Failed to fetch payment requests." });
  }
});

// =============================
// POST: Upload payment receipt
// =============================
router.post("/admin/:requestId/upload-receipt", auth, authorizeRoles("admin"), upload.single("receipt"), async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No receipt file uploaded." });
    }

    const request = await PaymentRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Payment request not found." });

    // Store the file path
    request.paymentReceipt = `/uploads/payment-receipts/${req.file.filename}`;
    await request.save();

    res.status(200).json({ 
      message: "Receipt uploaded successfully.", 
      receiptUrl: request.paymentReceipt,
      request 
    });
  } catch (err) {
    console.error("❌ Error uploading receipt:", err);
    res.status(500).json({ error: "Failed to upload receipt." });
  }
});

// =============================
// PATCH: approve/reject/paid payment request with receipt
// =============================
router.patch("/admin/:requestId", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNote, transactionId, paymentDate } = req.body;

    if (!["approved", "rejected", "paid", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'approved', 'rejected', 'paid', or 'pending'." });
    }

    const request = await PaymentRequest.findById(requestId).populate("lease");
    if (!request) return res.status(404).json({ error: "Payment request not found." });

    // Track history if status changes
    if (request.status !== status) {
      request.history = request.history || [];
      request.history.push({
        status,
        adminNote: adminNote || "",
        changedAt: new Date(),
        changedBy: req.user._id,
      });
    }

    // Update status and fields
    request.status = status;
    if (adminNote) request.adminNote = adminNote;
    if (transactionId) request.transactionId = transactionId;
    if (paymentDate) request.paymentDate = new Date(paymentDate);
    request.reviewedAt = new Date();

    // Update lease payments if marked as paid
    if (status === "paid" && request.lease) {
      if (request.lease.paymentsMade < request.lease.totalPayments) {
        request.lease.paymentsMade += 1;
        if (request.lease.paymentsMade >= request.lease.totalPayments) {
          request.lease.status = "completed";
        }
        await request.lease.save();
      }
    }

    await request.save();

    res.status(200).json({ message: `Payment request ${status} successfully.`, request });
  } catch (err) {
    console.error("❌ Error updating payment request:", err);
    res.status(500).json({ error: "Failed to update payment request." });
  }
});

module.exports = router;
