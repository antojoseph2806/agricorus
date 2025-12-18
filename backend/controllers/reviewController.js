const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({ success, message, data });
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Buyer creates a review (allowed after return window ends: 7 days after delivery)
 */
exports.createReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, productId, rating, comment } = req.body;

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

    const review = await Review.create({
      orderId,
      productId,
      vendorId: product.vendorId,
      buyerId: userId,
      rating,
      comment: comment ? comment.trim() : undefined,
    });

    sendResponse(res, true, 'Review submitted', review, 201);
  } catch (error) {
    console.error('Create review error:', error);
    sendResponse(res, false, error.message || 'Error submitting review', null, 500);
  }
};

/**
 * Get reviews for a product (public)
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    const reviews = await Review.find({ productId })
      .populate('buyerId', 'name')
      .sort({ createdAt: -1 });

    sendResponse(res, true, 'Reviews fetched', reviews);
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

    const reviews = await Review.find({ orderId, buyerId: userId });
    sendResponse(res, true, 'Order reviews fetched', reviews);
  } catch (error) {
    console.error('Get buyer order reviews error:', error);
    sendResponse(res, false, 'Error fetching reviews', null, 500);
  }
};

/**
 * Vendor: get reviews for their products
 */
exports.getVendorReviews = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { productId } = req.query;

    const query = { vendorId };
    if (productId && isValidObjectId(productId)) {
      query.productId = productId;
    }

    const reviews = await Review.find(query)
      .populate('productId', 'name images')
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    sendResponse(res, true, 'Vendor reviews fetched', reviews);
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    sendResponse(res, false, 'Error fetching vendor reviews', null, 500);
  }
};


