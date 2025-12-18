const express = require('express');
const router = express.Router();
const {
  getMarketplaceProducts,
  getProductDetails
} = require('../controllers/marketplaceController');

/**
 * @route   GET /api/marketplace/products
 * @desc    Get all active products from verified vendors (PUBLIC)
 * @access  Public
 */
router.get('/', getMarketplaceProducts);

/**
 * @route   GET /api/marketplace/products/:id
 * @desc    Get single product details (PUBLIC)
 * @access  Public
 */
router.get('/:id', getProductDetails);

module.exports = router;

