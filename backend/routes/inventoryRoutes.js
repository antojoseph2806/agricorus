const express = require('express');
const router = express.Router();
const {
  getInventoryOverview,
  updateProductStock,
  getLowStockAlerts,
  getStockMovements,
  bulkUpdateStock
} = require('../controllers/inventoryController');
const vendorAuth = require('../middleware/vendorAuth');

// @route   GET /api/vendor/inventory
// @desc    Get inventory overview
// @access  Private (Vendor only)
router.get('/', vendorAuth, getInventoryOverview);

// @route   GET /api/vendor/inventory/alerts
// @desc    Get low stock alerts
// @access  Private (Vendor only)
router.get('/alerts', vendorAuth, getLowStockAlerts);

// @route   GET /api/vendor/inventory/movements
// @desc    Get stock movement history
// @access  Private (Vendor only)
router.get('/movements', vendorAuth, getStockMovements);

// @route   PATCH /api/vendor/inventory/:productId/stock
// @desc    Update product stock manually
// @access  Private (Vendor only)
router.patch('/:productId/stock', vendorAuth, updateProductStock);

// @route   PATCH /api/vendor/inventory/bulk-update
// @desc    Bulk update stock for multiple products
// @access  Private (Vendor only)
router.patch('/bulk-update', vendorAuth, bulkUpdateStock);

module.exports = router;