const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  createReview,
  getProductReviews,
  getOrderReviewsForBuyer,
  uploadReviewPhotos,
  voteOnReview
} = require('../controllers/reviewController');

// Public product reviews
router.get('/product/:productId', getProductReviews);

// Buyer-only routes
router.use(auth);
router.use(authorizeRoles('farmer', 'landowner', 'investor'));

// Review creation with photo upload support
router.post('/', uploadReviewPhotos, createReview);

// Photo upload endpoint (separate for testing)
router.post('/upload-photos', uploadReviewPhotos);

// Get buyer's reviews for specific order
router.get('/order/:orderId', getOrderReviewsForBuyer);

// Vote on reviews (helpful/unhelpful)
router.post('/:reviewId/vote', voteOnReview);

module.exports = router;


