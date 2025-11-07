const express = require("express");
const router = express.Router();
const ReturnRequest = require("../models/ReturnRequest");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const PayoutMethod = require("../models/PayoutMethod");

// ============================================================
// @route   POST /api/investor/return-requests
// @desc    Submit a new return request (Investor)
// ============================================================
router.post("/", auth, authorizeRoles("investor"), async (req, res) => {
  try {
    const { investmentId, payoutMethodId } = req.body;

    if (!investmentId || !payoutMethodId) {
      return res
        .status(400)
        .json({ message: "Investment and payout method are required." });
    }

    // Prevent duplicate return requests for the same investment
    const existing = await ReturnRequest.findOne({
      investor: req.user.id,
      investmentId,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already submitted a return request for this investment.",
      });
    }

    const newRequest = await ReturnRequest.create({
      investor: req.user.id,
      investmentId,
      payoutMethodId,
      status: "pending", // default status
    });

    res.status(201).json({
      message: "Return request submitted successfully.",
      returnRequest: newRequest,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error while submitting return request." });
  }
});

// ============================================================
// @route   GET /api/investor/return-requests
// @desc    Get all return requests for logged-in investor
// ============================================================
router.get("/", auth, authorizeRoles("investor"), async (req, res) => {
  try {
    const requests = await ReturnRequest.find({ investor: req.user.id })
      .populate("payoutMethodId", "methodName accountNumber details"); 

    if (!requests || requests.length === 0) {
      return res
        .status(200)
        .json({ message: "No return requests found.", returnRequests: [] });
    }

    res.status(200).json({
      message: "Return requests retrieved successfully.",
      returnRequests: requests,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error while fetching return requests." });
  }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

// @route   GET /api/admin/return-requests
// @desc    Get all return requests (Admin)
router.get("/admin", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const requests = await ReturnRequest.find()
      .populate("investor", "name email") // show investor info
      .populate("payoutMethodId", "methodName accountNumber details");

    res.status(200).json({
      message: "All return requests retrieved successfully.",
      returnRequests: requests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching requests." });
  }
});

// @route   PATCH /api/admin/return-requests/:id
// @desc    Update status of a return request (Admin)
router.patch("/admin/:id", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "approved", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    const request = await ReturnRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Return request not found." });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Return request ${status} successfully.`,
      returnRequest: request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating request." });
  }
});

module.exports = router;
