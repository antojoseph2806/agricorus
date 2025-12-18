const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getKycRequests,
  getKycRequestDetails,
  approveKyc,
  rejectKyc,
  getKycStats,
  getVerifiedVendors
} = require('../controllers/adminKycController');

// All routes require admin authentication
router.use(auth, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/kyc/requests
 * @desc    Get all KYC requests with filters
 * @access  Private (Admin only)
 */
router.get('/requests', getKycRequests);

/**
 * @route   GET /api/admin/kyc/requests/:id
 * @desc    Get specific KYC request details
 * @access  Private (Admin only)
 */
router.get('/requests/:id', getKycRequestDetails);

/**
 * @route   PUT /api/admin/kyc/approve/:id
 * @desc    Approve KYC request
 * @access  Private (Admin only)
 */
router.put('/approve/:id', approveKyc);

/**
 * @route   PUT /api/admin/kyc/reject/:id
 * @desc    Reject KYC request
 * @access  Private (Admin only)
 */
router.put('/reject/:id', rejectKyc);

/**
 * @route   GET /api/admin/kyc/stats
 * @desc    Get KYC statistics
 * @access  Private (Admin only)
 */
router.get('/stats', getKycStats);

/**
 * @route   GET /api/admin/kyc/verified-vendors
 * @desc    Get verified vendors with optional filters
 * @access  Private (Admin only)
 */
router.get('/verified-vendors', getVerifiedVendors);

module.exports = router;