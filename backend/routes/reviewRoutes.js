const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  createReview,
  getProductReviews,
  getOrderReviewsForBuyer
} = require('../controllers/reviewController');

// Public product reviews
router.get('/product/:productId', getProductReviews);

// Buyer-only routes
router.use(auth);
router.use(authorizeRoles('farmer', 'landowner', 'investor'));

router.post('/', createReview);
router.get('/order/:orderId', getOrderReviewsForBuyer);

module.exports = router;


