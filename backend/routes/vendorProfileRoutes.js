const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const { uploadKYCDocuments } = require('../middleware/uploadKYC');
const {
  getVendorProfile,
  getKYCStatus,
  createVendorProfile,
  updateVendorProfile
} = require('../controllers/vendorProfileController');

/**
 * @route   GET /api/vendor/profile
 * @desc    Get vendor profile & KYC status
 * @access  Private (Vendor only)
 */
router.get('/', vendorAuth, getVendorProfile);

/**
 * @route   GET /api/vendor/profile/status
 * @desc    Get lightweight KYC status check
 * @access  Private (Vendor only)
 */
router.get('/status', vendorAuth, getKYCStatus);

/**
 * @route   POST /api/vendor/profile
 * @desc    Create profile & submit KYC
 * @access  Private (Vendor only)
 */
router.post(
  '/',
  vendorAuth,
  uploadKYCDocuments,
  createVendorProfile
);

/**
 * @route   PUT /api/vendor/profile
 * @desc    Update profile (only if NOT VERIFIED)
 * @access  Private (Vendor only)
 */
router.put(
  '/',
  vendorAuth,
  uploadKYCDocuments,
  updateVendorProfile
);

module.exports = router;

