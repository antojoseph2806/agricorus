const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  checkout,
  getUserOrders,
  getOrderDetails,
  requestReturn,
  cancelOrder,
  returnOrder,
  replaceOrder
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

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order (only if PLACED or CONFIRMED)
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.put('/:id/cancel', auth, authorizeRoles('farmer', 'landowner', 'investor'), cancelOrder);

/**
 * @route   POST /api/orders/:id/return
 * @desc    Request a return for delivered order
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/:id/return', auth, authorizeRoles('farmer', 'landowner', 'investor'), returnOrder);

/**
 * @route   POST /api/orders/:id/replace
 * @desc    Request a replacement for delivered order
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/:id/replace', auth, authorizeRoles('farmer', 'landowner', 'investor'), replaceOrder);

module.exports = router;

