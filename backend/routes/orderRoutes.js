const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  checkout,
  getUserOrders,
  getOrderDetails,
  requestReturn
} = require('../controllers/orderController');

/**
 * @route   POST /api/orders/checkout
 * @desc    Create order from cart
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/checkout', auth, authorizeRoles('farmer', 'landowner', 'investor'), checkout);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.get('/', auth, authorizeRoles('farmer', 'landowner', 'investor'), getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.get('/:id', auth, authorizeRoles('farmer', 'landowner', 'investor'), getOrderDetails);

/**
 * @route   POST /api/orders/:id/return-request
 * @desc    Buyer requests return within 7 days of delivery
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/:id/return-request', auth, authorizeRoles('farmer', 'landowner', 'investor'), requestReturn);

module.exports = router;

