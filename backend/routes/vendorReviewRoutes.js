const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const { getVendorReviews } = require('../controllers/reviewController');

router.use(vendorAuth);

/**
 * @route   GET /api/vendor/reviews
 * @desc    Get reviews for vendor products
 * @access  Private (Vendor only)
 */
router.get('/', getVendorReviews);

module.exports = router;


