const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  createRazorpayOrder,
  verifyPayment,
  createCodOrder
} = require('../controllers/marketplacePaymentController');

// All routes require buyer authentication
router.use(auth);
router.use(authorizeRoles('farmer', 'landowner', 'investor'));

/**
 * @route   POST /api/marketplace/payments/create-order
 * @desc    Create Razorpay order for marketplace checkout
 * @access  Private (Buyer roles only)
 */
router.post('/create-order', createRazorpayOrder);

/**
 * @route   POST /api/marketplace/payments/verify
 * @desc    Verify Razorpay payment and create order
 * @access  Private (Buyer roles only)
 */
router.post('/verify', verifyPayment);

/**
 * @route   POST /api/marketplace/payments/cod
 * @desc    Place Cash on Delivery order
 * @access  Private (Buyer roles only)
 */
router.post('/cod', createCodOrder);

module.exports = router;

