const VendorProfile = require('../models/VendorProfile');
const Vendor = require('../models/Vendor');
const { sendResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/admin/kyc/requests
 * @desc    Get all KYC requests with filters
 * @access  Private (Admin only)
 */
exports.getKycRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build query
    let query = {};
    if (status && status !== 'ALL') {
      query.kycStatus = status;
    }
    
    console.log('KYC Requests - Initial query:', query);
    
    // Search functionality
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { panNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('KYC Requests - Final query:', query);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Debug: Check all profiles
    const allProfiles = await VendorProfile.find({}).select('kycStatus businessName ownerName').lean();
    console.log('All vendor profiles for KYC requests:', allProfiles);
    
    const kycRequests = await VendorProfile.find(query)
      .populate('vendorId', 'name email phone createdAt')
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    console.log('Found KYC requests:', kycRequests);
    
    const total = await VendorProfile.countDocuments(query);
    
    sendResponse(res, true, 'KYC requests retrieved successfully', {
      requests: kycRequests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: kycRequests.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Get KYC requests error:', error);
    sendResponse(res, false, 'Error retrieving KYC requests', null, 500);
  }
};

/**
 * @route   GET /api/admin/kyc/requests/:id
 * @desc    Get specific KYC request details
 * @access  Private (Admin only)
 */
exports.getKycRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kycRequest = await VendorProfile.findById(id)
      .populate('vendorId', 'name email phone createdAt')
      .lean();
    
    if (!kycRequest) {
      return sendResponse(res, false, 'KYC request not found', null, 404);
    }
    
    sendResponse(res, true, 'KYC request details retrieved successfully', kycRequest);
  } catch (error) {
    console.error('Get KYC request details error:', error);
    sendResponse(res, false, 'Error retrieving KYC request details', null, 500);
  }
};

/**
 * @route   PUT /api/admin/kyc/approve/:id
 * @desc    Approve KYC request
 * @access  Private (Admin only)
 */
exports.approveKyc = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kycRequest = await VendorProfile.findById(id);
    
    if (!kycRequest) {
      return sendResponse(res, false, 'KYC request not found', null, 404);
    }
    
    if (kycRequest.kycStatus === 'VERIFIED') {
      return sendResponse(res, false, 'KYC request is already verified', null, 400);
    }
    
    kycRequest.kycStatus = 'VERIFIED';
    kycRequest.verifiedAt = new Date();
    kycRequest.rejectionReason = undefined;
    
    await kycRequest.save();
    
    // Populate vendor details for response
    await kycRequest.populate('vendorId', 'name email phone');
    
    sendResponse(res, true, 'KYC request approved successfully', kycRequest);
  } catch (error) {
    console.error('Approve KYC error:', error);
    sendResponse(res, false, 'Error approving KYC request', null, 500);
  }
};

/**
 * @route   PUT /api/admin/kyc/reject/:id
 * @desc    Reject KYC request
 * @access  Private (Admin only)
 */
exports.rejectKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return sendResponse(res, false, 'Rejection reason is required', null, 400);
    }
    
    const kycRequest = await VendorProfile.findById(id);
    
    if (!kycRequest) {
      return sendResponse(res, false, 'KYC request not found', null, 404);
    }
    
    if (kycRequest.kycStatus === 'VERIFIED') {
      return sendResponse(res, false, 'Cannot reject a verified KYC request', null, 400);
    }
    
    kycRequest.kycStatus = 'REJECTED';
    kycRequest.rejectionReason = rejectionReason.trim();
    kycRequest.verifiedAt = undefined;
    
    await kycRequest.save();
    
    // Populate vendor details for response
    await kycRequest.populate('vendorId', 'name email phone');
    
    sendResponse(res, true, 'KYC request rejected successfully', kycRequest);
  } catch (error) {
    console.error('Reject KYC error:', error);
    sendResponse(res, false, 'Error rejecting KYC request', null, 500);
  }
};

/**
 * @route   GET /api/admin/kyc/stats
 * @desc    Get KYC statistics
 * @access  Private (Admin only)
 */
exports.getKycStats = async (req, res) => {
  try {
    const stats = await VendorProfile.aggregate([
      {
        $group: {
          _id: '$kycStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Initialize all statuses with 0
    const statusCounts = {
      PENDING: 0,
      SUBMITTED: 0,
      VERIFIED: 0,
      REJECTED: 0
    };
    
    // Fill in actual counts
    stats.forEach(stat => {
      if (statusCounts.hasOwnProperty(stat._id)) {
        statusCounts[stat._id] = stat.count;
      }
    });
    
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    
    sendResponse(res, true, 'KYC statistics retrieved successfully', {
      ...statusCounts,
      TOTAL: total
    });
  } catch (error) {
    console.error('Get KYC stats error:', error);
    sendResponse(res, false, 'Error retrieving KYC statistics', null, 500);
  }
};

/**
 * @route   GET /api/admin/kyc/verified-vendors
 * @desc    Get verified vendors with optional filters
 * @access  Private (Admin only)
 */
exports.getVerifiedVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, businessType } = req.query;
    
    // Build query for verified vendors
    let query = { kycStatus: 'VERIFIED' };
    
    console.log('Searching for verified vendors with query:', query);
    
    // Search functionality
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Business type filter
    if (businessType && businessType !== 'ALL') {
      query.businessType = businessType;
    }
    
    console.log('Final query:', query);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // First, let's check all vendor profiles to debug
    const allProfiles = await VendorProfile.find({}).select('kycStatus businessName ownerName').lean();
    console.log('All vendor profiles:', allProfiles);
    
    const verifiedVendors = await VendorProfile.find(query)
      .populate('vendorId', 'name email phone createdAt')
      .select('businessName ownerName email phone address businessType establishedYear verifiedAt vendorId')
      .sort({ verifiedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    console.log('Found verified vendors:', verifiedVendors);
    
    const total = await VendorProfile.countDocuments(query);
    console.log('Total verified vendors count:', total);
    
    sendResponse(res, true, 'Verified vendors retrieved successfully', {
      vendors: verifiedVendors,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: verifiedVendors.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Get verified vendors error:', error);
    sendResponse(res, false, 'Error retrieving verified vendors', null, 500);
  }
};