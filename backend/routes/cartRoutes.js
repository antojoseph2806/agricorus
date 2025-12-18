const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.get('/', auth, authorizeRoles('farmer', 'landowner', 'investor'), getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/add', auth, authorizeRoles('farmer', 'landowner', 'investor'), addToCart);

/**
 * @route   PATCH /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.patch('/update', auth, authorizeRoles('farmer', 'landowner', 'investor'), updateCartItem);

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.delete('/remove/:productId', auth, authorizeRoles('farmer', 'landowner', 'investor'), removeFromCart);

module.exports = router;

