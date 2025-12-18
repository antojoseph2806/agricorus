const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getUserKycRequests,
  getUserKycDetails,
  approveUserKyc,
  rejectUserKyc,
  getUserKycStats,
  deleteUserKyc
} = require('../controllers/userKycController');

// All routes require admin authentication
router.use(auth, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/user-kyc/requests
 * @desc    Get all user KYC requests with filters
 * @access  Private (Admin only)
 */
router.get('/requests', getUserKycRequests);

/**
 * @route   GET /api/admin/user-kyc/requests/:id
 * @desc    Get specific user KYC request details
 * @access  Private (Admin only)
 */
router.get('/requests/:id', getUserKycDetails);

/**
 * @route   PUT /api/admin/user-kyc/approve/:id
 * @desc    Approve user KYC request
 * @access  Private (Admin only)
 */
router.put('/approve/:id', approveUserKyc);

/**
 * @route   PUT /api/admin/user-kyc/reject/:id
 * @desc    Reject user KYC request
 * @access  Private (Admin only)
 */
router.put('/reject/:id', rejectUserKyc);

/**
 * @route   GET /api/admin/user-kyc/stats
 * @desc    Get user KYC statistics
 * @access  Private (Admin only)
 */
router.get('/stats', getUserKycStats);

/**
 * @route   DELETE /api/admin/user-kyc/:id
 * @desc    Delete KYC request (allows resubmission)
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteUserKyc);

module.exports = router;
