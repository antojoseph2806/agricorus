const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { uploadReviewPhotos, handleUploadError, deleteUploadedFiles, getFileUrl } = require('../utils/reviewPhotoUpload');

const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({ success, message, data });
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Buyer creates a review with optional photo uploads
 */
exports.createReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, productId, rating, comment, photoCaptions } = req.body;

    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Only buyers can create reviews', null, 403);
    }

    if (!orderId || !productId || rating === undefined) {
      return sendResponse(res, false, 'orderId, productId and rating are required', null, 400);
    }

    if (!isValidObjectId(orderId) || !isValidObjectId(productId)) {
      return sendResponse(res, false, 'Invalid orderId or productId', null, 400);
    }

    if (rating < 1 || rating > 5) {
      return sendResponse(res, false, 'Rating must be between 1 and 5', null, 400);
    }

    const order = await Order.findOne({ _id: orderId, buyerId: userId });
    if (!order) return sendResponse(res, false, 'Order not found', null, 404);

    if (order.orderStatus !== 'DELIVERED') {
      return sendResponse(res, false, 'Reviews allowed only after delivery', null, 400);
    }

    if (!order.deliveredAt) {
      return sendResponse(res, false, 'Delivery date not recorded. Contact support.', null, 400);
    }

    const daysSinceDelivery = (Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery < 7) {
      return sendResponse(res, false, 'You can review after the 7-day return period ends', null, 400);
    }

    const hasProduct = order.items.some((i) => i.productId.toString() === productId.toString());
    if (!hasProduct) {
      return sendResponse(res, false, 'Product not part of this order', null, 400);
    }

    const product = await Product.findById(productId);
    if (!product) return sendResponse(res, false, 'Product not found', null, 404);

    // Ensure unique review per buyer per order-product
    const exists = await Review.findOne({ buyerId: userId, orderId, productId });
    if (exists) {
      return sendResponse(res, false, 'You already reviewed this product for this order', null, 400);
    }

    // Process uploaded photos
    const photos = [];
    if (req.files && req.files.length > 0) {
      const captions = photoCaptions ? JSON.parse(photoCaptions) : [];
      
      req.files.forEach((file, index) => {
        photos.push({
          url: getFileUrl(file.filename),
          caption: captions[index] || '',
          uploadedAt: new Date()
        });
      });
    }

    const review = await Review.create({
      orderId,
      productId,
      vendorId: product.vendorId,
      buyerId: userId,
      rating,
      comment: comment ? comment.trim() : undefined,
      photos: photos,
      isVerifiedPurchase: true
    });

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
      .populate('buyerId', 'name')
      .populate('productId', 'name');

    sendResponse(res, true, 'Review submitted successfully', populatedReview, 201);
  } catch (error) {
    console.error('Create review error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      deleteUploadedFiles(req.files);
    }
    
    sendResponse(res, false, error.message || 'Error submitting review', null, 500);
  }
};

/**
 * Upload review photos endpoint
 */
exports.uploadReviewPhotos = (req, res, next) => {
  uploadReviewPhotos(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }
    
    if (!req.files || req.files.length === 0) {
      return sendResponse(res, false, 'No files uploaded', null, 400);
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: getFileUrl(file.filename),
      size: file.size
    }));

    sendResponse(res, true, 'Photos uploaded successfully', { files: uploadedFiles });
  });
};

/**
 * Get reviews for a product (public) - enhanced with photos
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
    
    if (!isValidObjectId(productId)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'highest-rated':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'lowest-rated':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      case 'most-helpful':
        sortCriteria = { helpfulVotes: -1, createdAt: -1 };
        break;
      default: // newest
        sortCriteria = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount, ratingStats] = await Promise.all([
      Review.find({ productId })
        .populate('buyerId', 'name')
        .sort(sortCriteria)
        .skip(skip)
        .limit(parseInt(limit)),
      
      Review.countDocuments({ productId }),
      
      Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ])
    ]);

    // Calculate rating distribution
    let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });
    }

    const responseData = {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalReviews: totalCount,
        hasNext: skip + reviews.length < totalCount,
        hasPrev: parseInt(page) > 1
      },
      stats: {
        averageRating: ratingStats.length > 0 ? Number(ratingStats[0].averageRating.toFixed(1)) : 0,
        totalReviews: totalCount,
        ratingDistribution: distribution
      }
    };

    sendResponse(res, true, 'Reviews fetched successfully', responseData);
  } catch (error) {
    console.error('Get product reviews error:', error);
    sendResponse(res, false, 'Error fetching reviews', null, 500);
  }
};

/**
 * Get reviews for a buyer on a specific order (to know which items are reviewed)
 */
exports.getOrderReviewsForBuyer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return sendResponse(res, false, 'Invalid order ID', null, 400);
    }

    const reviews = await Review.find({ orderId, buyerId: userId })
      .populate('productId', 'name images');
      
    sendResponse(res, true, 'Order reviews fetched', reviews);
  } catch (error) {
    console.error('Get buyer order reviews error:', error);
    sendResponse(res, false, 'Error fetching reviews', null, 500);
  }
};

/**
 * Vendor: get reviews for their products - enhanced with photos
 */
exports.getVendorReviews = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { productId, page = 1, limit = 10 } = req.query;

    const query = { vendorId };
    if (productId && isValidObjectId(productId)) {
      query.productId = productId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      Review.find(query)
        .populate('productId', 'name images')
        .populate('buyerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      Review.countDocuments(query)
    ]);

    const responseData = {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalReviews: totalCount,
        hasNext: skip + reviews.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    };

    sendResponse(res, true, 'Vendor reviews fetched', responseData);
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    sendResponse(res, false, 'Error fetching vendor reviews', null, 500);
  }
};

/**
 * Mark review as helpful/unhelpful
 */
exports.voteOnReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // 'helpful' or 'unhelpful'
    
    if (!isValidObjectId(reviewId)) {
      return sendResponse(res, false, 'Invalid review ID', null, 400);
    }

    if (!['helpful', 'unhelpful'].includes(voteType)) {
      return sendResponse(res, false, 'Vote type must be "helpful" or "unhelpful"', null, 400);
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return sendResponse(res, false, 'Review not found', null, 404);
    }

    // Update vote count
    if (voteType === 'helpful') {
      review.helpfulVotes += 1;
    } else {
      review.unhelpfulVotes += 1;
    }

    await review.save();

    sendResponse(res, true, 'Vote recorded successfully', {
      helpfulVotes: review.helpfulVotes,
      unhelpfulVotes: review.unhelpfulVotes,
      totalVotes: review.totalVotes,
      helpfulnessRatio: review.helpfulnessRatio
    });
  } catch (error) {
    console.error('Vote on review error:', error);
    sendResponse(res, false, 'Error recording vote', null, 500);
  }
};


