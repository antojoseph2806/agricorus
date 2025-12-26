const express = require('express');
const router = express.Router();
const {
  getVendorPayments,
  getPaymentDetails,
  processRefund,
  getPaymentAnalytics
} = require('../controllers/vendorPaymentController');
const vendorAuth = require('../middleware/vendorAuth');

// Apply vendor authentication to all routes
router.use(vendorAuth);

// @route   GET /api/vendor/payments
// @desc    Get vendor payments with filtering and pagination
// @access  Private (Vendor only)
router.get('/', getVendorPayments);

// @route   GET /api/vendor/payments/analytics
// @desc    Get payment analytics
// @access  Private (Vendor only)
router.get('/analytics', getPaymentAnalytics);

// @route   GET /api/vendor/payments/:id
// @desc    Get single payment details
// @access  Private (Vendor only)
router.get('/:id', getPaymentDetails);

// @route   POST /api/vendor/payments/:id/refund
// @desc    Process refund request
// @access  Private (Vendor only)
router.post('/:id/refund', processRefund);

module.exports = router;