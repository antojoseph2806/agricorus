const KYC = require('../models/kycModel');
const User = require('../models/User');

/**
 * @route   GET /api/admin/user-kyc/requests
 * @desc    Get all user KYC requests (farmer, landowner, investor)
 * @access  Private (Admin only)
 */
exports.getUserKycRequests = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10, search } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get KYC requests with user details
    let kycQuery = KYC.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone role createdAt',
        match: role && role !== 'ALL' ? { role: role } : {}
      })
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add search if provided
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    const kycRequests = await kycQuery;
    
    // Filter out null userId (from populate match)
    const filteredRequests = kycRequests.filter(req => req.userId !== null);
    
    const total = await KYC.countDocuments(query);
    
    res.json({
      success: true,
      message: 'KYC requests retrieved successfully',
      data: {
        requests: filteredRequests,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: filteredRequests.length,
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Get user KYC requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving KYC requests',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/user-kyc/requests/:id
 * @desc    Get specific user KYC request details
 * @access  Private (Admin only)
 */
exports.getUserKycDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kycRequest = await KYC.findById(id)
      .populate('userId', 'name email phone role createdAt')
      .populate('verifiedBy', 'name email')
      .lean();
    
    if (!kycRequest) {
      return res.status(404).json({
        success: false,
        message: 'KYC request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'KYC request details retrieved successfully',
      data: kycRequest
    });
  } catch (error) {
    console.error('Get user KYC details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving KYC request details',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/user-kyc/approve/:id
 * @desc    Approve user KYC request
 * @access  Private (Admin only)
 */
exports.approveUserKyc = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kycRequest = await KYC.findById(id).populate('userId', 'name email role');
    
    if (!kycRequest) {
      return res.status(404).json({
        success: false,
        message: 'KYC request not found'
      });
    }
    
    if (kycRequest.status === 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'KYC request is already verified'
      });
    }
    
    kycRequest.status = 'Verified';
    kycRequest.verifiedAt = new Date();
    kycRequest.verifiedBy = req.user._id;
    kycRequest.rejectionReason = undefined;
    
    await kycRequest.save();
    
    // Populate for response
    await kycRequest.populate('verifiedBy', 'name email');
    
    res.json({
      success: true,
      message: 'KYC request approved successfully',
      data: kycRequest
    });
  } catch (error) {
    console.error('Approve user KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving KYC request',
      error: error.message
    });
  }
};

/**
 * @route   PUT /api/admin/user-kyc/reject/:id
 * @desc    Reject user KYC request
 * @access  Private (Admin only)
 */
exports.rejectUserKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const kycRequest = await KYC.findById(id).populate('userId', 'name email role');
    
    if (!kycRequest) {
      return res.status(404).json({
        success: false,
        message: 'KYC request not found'
      });
    }
    
    if (kycRequest.status === 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject a verified KYC request'
      });
    }
    
    kycRequest.status = 'Rejected';
    kycRequest.rejectionReason = rejectionReason.trim();
    kycRequest.verifiedAt = undefined;
    kycRequest.verifiedBy = req.user._id;
    
    await kycRequest.save();
    
    // Populate for response
    await kycRequest.populate('verifiedBy', 'name email');
    
    res.json({
      success: true,
      message: 'KYC request rejected successfully',
      data: kycRequest
    });
  } catch (error) {
    console.error('Reject user KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting KYC request',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/user-kyc/stats
 * @desc    Get user KYC statistics
 * @access  Private (Admin only)
 */
exports.getUserKycStats = async (req, res) => {
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
      {
        $unwind: '$user'
      },
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
    
    // Initialize all combinations
    const statusCounts = {
      Pending: { farmer: 0, landowner: 0, investor: 0, total: 0 },
      Verified: { farmer: 0, landowner: 0, investor: 0, total: 0 },
      Rejected: { farmer: 0, landowner: 0, investor: 0, total: 0 }
    };
    
    // Fill in actual counts
    stats.forEach(stat => {
      const status = stat._id.status;
      const role = stat._id.role;
      if (statusCounts[status] && ['farmer', 'landowner', 'investor'].includes(role)) {
        statusCounts[status][role] = stat.count;
        statusCounts[status].total += stat.count;
      }
    });
    
    const totalKyc = Object.values(statusCounts).reduce((sum, status) => sum + status.total, 0);
    
    res.json({
      success: true,
      message: 'KYC statistics retrieved successfully',
      data: {
        ...statusCounts,
        TOTAL: totalKyc
      }
    });
  } catch (error) {
    console.error('Get user KYC stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving KYC statistics',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/admin/user-kyc/:id
 * @desc    Delete KYC request (allows resubmission)
 * @access  Private (Admin only)
 */
exports.deleteUserKyc = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kycRequest = await KYC.findByIdAndDelete(id);
    
    if (!kycRequest) {
      return res.status(404).json({
        success: false,
        message: 'KYC request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'KYC request deleted successfully. User can now resubmit.'
    });
  } catch (error) {
    console.error('Delete user KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting KYC request',
      error: error.message
    });
  }
};
