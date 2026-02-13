const express = require('express');
const router = express.Router();
const {
  getMarketplaceProducts,
  getProductDetails,
  getBatchProducts
} = require('../controllers/marketplaceController');

/**
 * @route   GET /api/marketplace/products
 * @desc    Get all active products from verified vendors (PUBLIC)
 * @access  Public
 */
router.get('/', getMarketplaceProducts);

/**
 * @route   POST /api/marketplace/products/batch
 * @desc    Get multiple products by IDs (for guest cart)
 * @access  Public
 */
router.post('/batch', getBatchProducts);

/**
 * @route   GET /api/marketplace/products/:id
 * @desc    Get single product details (PUBLIC)
 * @access  Public
 */
router.get('/:id', getProductDetails);

module.exports = router;

