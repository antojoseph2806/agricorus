const express = require('express');
const router = express.Router();
const vendorAuth = require('../middleware/vendorAuth');
const { uploadProductFiles } = require('../middleware/uploadProduct');
const {
  createProduct,
  getVendorProducts,
  getProductById,
  updateProduct,
  updateStockAndPrice,
  updateInventory,
  deleteProduct
} = require('../controllers/productController');

/**
 * @route   POST /api/vendor/products
 * @desc    Create a new product
 * @access  Private (Vendor only)
 */
router.post(
  '/',
  vendorAuth,
  uploadProductFiles,
  createProduct
);

/**
 * @route   GET /api/vendor/products
 * @desc    Get all products of logged-in vendor
 * @access  Private (Vendor only)
 */
router.get('/', vendorAuth, getVendorProducts);

/**
 * @route   GET /api/vendor/products/:id
 * @desc    Get single product by ID (vendor-owned only)
 * @access  Private (Vendor only)
 */
router.get('/:id', vendorAuth, getProductById);

/**
 * @route   PUT /api/vendor/products/:id
 * @desc    Update product details
 * @access  Private (Vendor only)
 */
router.put(
  '/:id',
  vendorAuth,
  uploadProductFiles,
  updateProduct
);

/**
 * @route   PATCH /api/vendor/products/:id/stock
 * @desc    Update stock & price
 * @access  Private (Vendor only)
 */
router.patch('/:id/stock', vendorAuth, updateStockAndPrice);

/**
 * @route   PATCH /api/vendor/products/:id/inventory
 * @desc    Update inventory (stock, price, isActive)
 * @access  Private (Vendor only)
 */
router.patch('/:id/inventory', vendorAuth, updateInventory);

/**
 * @route   DELETE /api/vendor/products/:id
 * @desc    Soft delete product (set isActive=false)
 * @access  Private (Vendor only)
 */
router.delete('/:id', vendorAuth, deleteProduct);

module.exports = router;

