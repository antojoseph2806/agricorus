const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const mongoose = require('mongoose');

/**
 * Helper function to format API response
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};

/**
 * Helper function to validate ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * @route   POST /api/orders/checkout
 * @desc    Create order from cart
 * @access  Private (Farmer/Landowner only)
 */
exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { deliveryAddress, notes } = req.body;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can place orders.', null, 403);
    }

    // Validate delivery address
    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.district || 
        !deliveryAddress.state || !deliveryAddress.pincode) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Complete delivery address is required', null, 400);
    }

    // Validate pincode
    if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Pincode must be 6 digits', null, 400);
    }

    // Get cart
    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || !cart.items || cart.items.length === 0) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Cart is empty', null, 400);
    }

    // Validate all cart items and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      // Find product with session for transaction
      const product = await Product.findById(cartItem.productId).session(session);
      
      if (!product) {
        await session.abortTransaction();
        return sendResponse(res, false, `Product ${cartItem.productId} not found`, null, 404);
      }

      // Check if product is active
      if (!product.isActive) {
        await session.abortTransaction();
        return sendResponse(res, false, `Product "${product.name}" is no longer available`, null, 400);
      }

      // Check if vendor is verified
      const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
        .select('kycStatus')
        .lean();

      if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
        await session.abortTransaction();
        return sendResponse(res, false, `Product "${product.name}" from unverified vendor is not available`, null, 400);
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        return sendResponse(res, false, `Only ${product.stock} units available for "${product.name}"`, null, 400);
      }

      // Calculate subtotal (use current price, not priceAtAddTime for security)
      const subtotal = product.price * cartItem.quantity;
      totalAmount += subtotal;

      // Add to order items
      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        productName: product.name,
        quantity: cartItem.quantity,
        price: product.price,
        subtotal
      });

      // Lock stock by deducting it
      product.stock -= cartItem.quantity;
      await product.save({ session });
    }

    // Create order
    const order = await Order.create([{
      buyerId: userId,
      buyerRole: req.user.role,
      items: orderItems,
      totalAmount,
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        district: deliveryAddress.district.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim()
      },
      notes: notes ? notes.trim() : undefined,
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      returnStatus: 'NONE'
    }], { session });

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate order for response
    const populatedOrder = await Order.findById(order[0]._id)
      .populate('buyerId', 'name email')
      .populate('items.productId', 'name category images')
      .populate('items.vendorId', 'businessName')
      .lean();

    sendResponse(res, true, 'Order placed successfully', populatedOrder, 201);
  } catch (error) {
    await session.abortTransaction();
    console.error('Checkout error:', error);
    sendResponse(res, false, error.message || 'Error placing order', null, 500);
  } finally {
    session.endSession();
  }
};

/**
 * @route   POST /api/orders/:id/return-request
 * @desc    Request a return within 7 days of delivery
 * @access  Private (Farmer/Landowner/Investor only)
 */
exports.requestReturn = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only buyers can request returns.', null, 403);
    }

    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid order ID', null, 400);
    }

    const order = await Order.findOne({ _id: id, buyerId: userId });
    if (!order) {
      return sendResponse(res, false, 'Order not found', null, 404);
    }

    if (order.orderStatus !== 'DELIVERED') {
      return sendResponse(res, false, 'Return is allowed only after delivery', null, 400);
    }

    if (!order.deliveredAt) {
      return sendResponse(res, false, 'Delivery date not recorded. Please contact support.', null, 400);
    }

    const now = new Date();
    const daysSinceDelivery = (now.getTime() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return sendResponse(res, false, 'Return window (7 days) has expired', null, 400);
    }

    if (order.returnStatus === 'REQUESTED') {
      return sendResponse(res, false, 'Return already requested for this order', null, 400);
    }

    if (order.returnStatus === 'APPROVED') {
      return sendResponse(res, false, 'Return already approved', null, 400);
    }

    order.returnStatus = 'REQUESTED';
    order.returnReason = reason ? reason.trim() : 'No reason provided';
    order.returnRequestedAt = now;

    await order.save();

    sendResponse(res, true, 'Return request submitted', {
      _id: order._id,
      orderStatus: order.orderStatus,
      returnStatus: order.returnStatus,
      returnReason: order.returnReason,
      returnRequestedAt: order.returnRequestedAt
    });
  } catch (error) {
    console.error('Return request error:', error);
    sendResponse(res, false, error.message || 'Error submitting return request', null, 500);
  }
};

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private (Farmer/Landowner only)
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can view orders.', null, 403);
    }

    const orders = await Order.find({ buyerId: userId })
      .populate('items.productId', 'name category images')
      .populate('items.vendorId', 'businessName')
      .sort({ createdAt: -1 })
      .lean();

    sendResponse(res, true, 'Orders retrieved successfully', orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    sendResponse(res, false, 'Error retrieving orders', null, 500);
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (Farmer/Landowner only)
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can view orders.', null, 403);
    }

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid order ID', null, 400);
    }

    const order = await Order.findOne({ _id: id, buyerId: userId })
      .populate('buyerId', 'name email')
      .populate('items.productId', 'name category images description warrantyPeriod')
      .populate('items.vendorId', 'businessName')
      .lean();

    if (!order) {
      return sendResponse(res, false, 'Order not found', null, 404);
    }

    sendResponse(res, true, 'Order details retrieved successfully', order);
  } catch (error) {
    console.error('Get order details error:', error);
    sendResponse(res, false, 'Error retrieving order details', null, 500);
  }
};

