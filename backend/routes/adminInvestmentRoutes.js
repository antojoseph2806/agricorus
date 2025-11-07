const express = require("express");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");
const Investment = require("../models/Investment");
const Project = require("../models/Project");

const router = express.Router();

// ✅ Razorpay instance (for optional refund feature)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Middleware: Admin only
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ---------------------------------------------------------------------------
// 🔹 GET /api/admin/investments
// List all investments (with optional filters & pagination)
// ---------------------------------------------------------------------------
router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const { investorId, projectId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (investorId) query.investorId = investorId;
    if (projectId) query.projectId = projectId;

    const skip = (page - 1) * limit;

    const [total, investments] = await Promise.all([
      Investment.countDocuments(query),
      Investment.find(query)
        .populate("investorId", "name email")
        .populate("projectId", "title fundingGoal currentFunding status")
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
    ]);

    res.json({
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
      investments,
    });
  } catch (err) {
    console.error("Admin get investments error:", err);
    res.status(500).json({ message: "Failed to fetch investments", error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 🔹 GET /api/admin/investments/:id
// Get full details of a specific investment
// ---------------------------------------------------------------------------
router.get("/:id", auth, adminOnly, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate("investorId", "name email")
      .populate("projectId", "title fundingGoal currentFunding status");

    if (!investment) return res.status(404).json({ message: "Investment not found" });

    res.json({ investment });
  } catch (err) {
    console.error("Admin get single investment error:", err);
    res.status(500).json({ message: "Failed to fetch investment", error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 🔹 DELETE /api/admin/investments/:id
// Delete an investment (admin action)
// ---------------------------------------------------------------------------
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) return res.status(404).json({ message: "Investment not found" });

    await investment.deleteOne();

    res.json({ message: "Investment deleted successfully" });
  } catch (err) {
    console.error("Admin delete investment error:", err);
    res.status(500).json({ message: "Failed to delete investment", error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 🔹 POST /api/admin/investments/:id/refund
// Issue a refund via Razorpay (optional feature)
// ---------------------------------------------------------------------------
router.post("/:id/refund", auth, adminOnly, async (req, res) => {
  try {
    const { amount } = req.body; // optional, INR
    const investment = await Investment.findById(req.params.id);
    if (!investment) return res.status(404).json({ message: "Investment not found" });

    if (!investment.paymentId) {
      return res.status(400).json({ message: "No paymentId found for this investment" });
    }

    const refundAmountPaise = amount ? Math.round(amount * 100) : Math.round(investment.amount * 100);

    // Create refund using Razorpay API
    const refund = await razorpay.payments.refund(investment.paymentId, {
      amount: refundAmountPaise,
    });

    // Optionally, adjust project funding (if business logic allows)
    await Project.findByIdAndUpdate(investment.projectId, {
      $inc: { currentFunding: -refundAmountPaise / 100 },
    });

    res.json({
      message: "Refund processed successfully",
      refund,
    });
  } catch (err) {
    console.error("Admin refund error:", err);
    const msg = err.error?.description || err.message;
    res.status(500).json({ message: "Refund failed", error: msg });
  }
});

// ---------------------------------------------------------------------------
// 🔹 GET /api/admin/investments/stats
// Overview stats (total amount, count per project)
// ---------------------------------------------------------------------------
router.get("/stats/summary", auth, adminOnly, async (req, res) => {
  try {
    const totalStats = await Investment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const perProject = await Investment.aggregate([
      {
        $group: {
          _id: "$projectId",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]);

    const populated = await Promise.all(
      perProject.map(async (p) => {
        const proj = await Project.findById(p._id).select("title");
        return {
          projectId: p._id,
          title: proj ? proj.title : "Unknown",
          totalAmount: p.totalAmount,
          count: p.count,
        };
      })
    );

    res.json({
      totals: totalStats[0] || { totalAmount: 0, totalCount: 0 },
      topProjects: populated,
    });
  } catch (err) {
    console.error("Admin investment stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

module.exports = router;
