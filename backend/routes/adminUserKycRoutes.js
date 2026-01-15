// routes/adminUserKycRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const KYC = require("../models/kycModel");
const User = require("../models/User");

const router = express.Router();

// Middleware for all routes
router.use(auth, authorizeRoles("admin"));

// GET ALL USER KYC REQUESTS with filters
router.get("/all", async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10, search } = req.query;
    
    // Build query
    let query = {};
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get KYC records with user details
    let kycRecords = await KYC.find(query)
      .populate('userId', 'name email phone role createdAt')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Filter by role if specified
    if (role && role !== 'all') {
      kycRecords = kycRecords.filter(kyc => kyc.userId?.role === role);
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      kycRecords = kycRecords.filter(kyc => 
        kyc.userId?.name?.toLowerCase().includes(searchLower) ||
        kyc.userId?.email?.toLowerCase().includes(searchLower) ||
        kyc.extractedNumber?.toLowerCase().includes(searchLower)
      );
    }
    
    const total = await KYC.countDocuments(query);
    
    res.json({
      success: true,
      data: kycRecords,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: kycRecords.length,
        totalRecords: total
      }
    });
  } catch (err) {
    console.error('Admin get user KYC error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET KYC STATS
router.get("/stats", async (req, res) => {
  try {
    const stats = await KYC.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: {
            status: '$status',
            role: '$user.role'
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Initialize counts
    const statusCounts = {
      Pending: 0,
      Verified: 0,
      Rejected: 0
    };
    
    const roleCounts = {
      landowner: 0,
      farmer: 0,
      investor: 0
    };
    
    stats.forEach(stat => {
      if (statusCounts.hasOwnProperty(stat._id.status)) {
        statusCounts[stat._id.status] += stat.count;
      }
      if (roleCounts.hasOwnProperty(stat._id.role)) {
        roleCounts[stat._id.role] += stat.count;
      }
    });
    
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    res.json({
      success: true,
      data: {
        byStatus: statusCounts,
        byRole: roleCounts,
        total
      }
    });
  } catch (err) {
    console.error('Get KYC stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET SINGLE KYC DETAILS
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid KYC ID" });
    }
    
    const kyc = await KYC.findById(req.params.id)
      .populate('userId', 'name email phone role createdAt')
      .populate('verifiedBy', 'name email')
      .lean();
    
    if (!kyc) {
      return res.status(404).json({ success: false, error: "KYC record not found" });
    }
    
    res.json({ success: true, data: kyc });
  } catch (err) {
    console.error('Get KYC details error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// APPROVE USER KYC
router.patch("/:id/approve", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid KYC ID" });
    }
    
    const kyc = await KYC.findById(req.params.id);
    
    if (!kyc) {
      return res.status(404).json({ success: false, error: "KYC record not found" });
    }
    
    if (kyc.status === 'Verified') {
      return res.status(400).json({ success: false, error: "KYC is already verified" });
    }
    
    kyc.status = 'Verified';
    kyc.verifiedAt = new Date();
    kyc.verifiedBy = req.user.id;
    kyc.rejectionReason = undefined;
    
    await kyc.save();
    
    // Populate for response
    await kyc.populate('userId', 'name email phone role');
    await kyc.populate('verifiedBy', 'name email');
    
    res.json({ 
      success: true,
      message: "KYC approved successfully",
      data: kyc
    });
  } catch (err) {
    console.error('Approve KYC error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// REJECT USER KYC
router.patch("/:id/reject", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid KYC ID" });
    }
    
    const { reason } = req.body;
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Rejection reason is required" });
    }
    
    const kyc = await KYC.findById(req.params.id);
    
    if (!kyc) {
      return res.status(404).json({ success: false, error: "KYC record not found" });
    }
    
    if (kyc.status === 'Verified') {
      return res.status(400).json({ success: false, error: "Cannot reject a verified KYC" });
    }
    
    kyc.status = 'Rejected';
    kyc.rejectionReason = reason.trim();
    kyc.verifiedAt = undefined;
    kyc.verifiedBy = req.user.id;
    
    await kyc.save();
    
    // Populate for response
    await kyc.populate('userId', 'name email phone role');
    
    res.json({ 
      success: true,
      message: "KYC rejected successfully",
      data: kyc
    });
  } catch (err) {
    console.error('Reject KYC error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET KYC BY ROLE
router.get("/role/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const validRoles = ['landowner', 'farmer', 'investor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role" });
    }
    
    // Get users with the specified role
    const users = await User.find({ role }).select('_id').lean();
    const userIds = users.map(u => u._id);
    
    let query = { userId: { $in: userIds } };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const kycRecords = await KYC.find(query)
      .populate('userId', 'name email phone role createdAt')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await KYC.countDocuments(query);
    
    res.json({
      success: true,
      data: kycRecords,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: kycRecords.length,
        totalRecords: total
      }
    });
  } catch (err) {
    console.error('Get KYC by role error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
