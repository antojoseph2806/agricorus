const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const {
  getVendorOrders,
  getVendorOrderDetails,
  updateOrderStatus
} = require('../controllers/vendorOrderController');

/**
 * @route   GET /api/vendor/orders
 * @desc    Get all orders for vendor's products
 * @access  Private (Vendor only)
 */
router.get('/', vendorAuth, getVendorOrders);

/**
 * @route   GET /api/vendor/orders/:id
 * @desc    Get single order details for vendor
 * @access  Private (Vendor only)
 */
router.get('/:id', vendorAuth, getVendorOrderDetails);

/**
 * @route   PATCH /api/vendor/orders/:id/status
 * @desc    Update order status with description
 * @access  Private (Vendor only)
 */
router.patch('/:id/status', vendorAuth, updateOrderStatus);

module.exports = router;
