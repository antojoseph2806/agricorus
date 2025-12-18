const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const mongoose = require('mongoose');

/**
 * Generate a unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

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

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/marketplace/payments/create-order
 * @desc    Create Razorpay order for marketplace checkout
 * @access  Private (Buyer roles only)
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify role (buyer roles only)
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only buyers can create payment orders.', null, 403);
    }

    // Get cart to calculate total
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return sendResponse(res, false, 'Cart is empty', null, 400);
    }

    // Validate all cart items and calculate total
    let totalAmount = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (!product || !product.isActive) {
        return sendResponse(res, false, `Product "${cartItem.productId}" is not available`, null, 400);
      }

      // Check vendor verification
      const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
        .select('kycStatus')
        .lean();

      if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
        return sendResponse(res, false, `Product from unverified vendor is not available`, null, 400);
      }

      // Check stock
      if (product.stock < cartItem.quantity) {
        return sendResponse(res, false, `Only ${product.stock} units available`, null, 400);
      }

      totalAmount += product.price * cartItem.quantity;
    }

    if (totalAmount <= 0) {
      return sendResponse(res, false, 'Invalid order amount', null, 400);
    }

    // Create Razorpay order
    const receipt = `marketplace_${Date.now()}_${userId.toString().slice(-6)}`;
    const options = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: receipt.substring(0, 40), // Razorpay receipt max 40 chars
      notes: {
        userId: userId.toString(),
        orderType: 'marketplace'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    sendResponse(res, true, 'Razorpay order created successfully', {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    sendResponse(res, false, error.message || 'Error creating payment order', null, 500);
  }
};

/**
 * @route   POST /api/marketplace/payments/verify
 * @desc    Verify Razorpay payment and create order
 * @access  Private (Buyer roles only)
 */
exports.verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      deliveryAddress,
      notes
    } = req.body;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Access denied. Only buyers can verify payments.', null, 403);
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

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Invalid payment signature', null, 400);
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (paymentDetails.status !== 'captured') {
      await session.abortTransaction();
      return sendResponse(res, false, 'Payment not captured', null, 400);
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
      const product = await Product.findById(cartItem.productId).session(session);
      
      if (!product || !product.isActive) {
        await session.abortTransaction();
        return sendResponse(res, false, `Product "${cartItem.productId}" is not available`, null, 400);
      }

      // Check vendor verification
      const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
        .select('kycStatus')
        .lean();

      if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
        await session.abortTransaction();
        return sendResponse(res, false, `Product from unverified vendor is not available`, null, 400);
      }

      // Check stock
      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        return sendResponse(res, false, `Only ${product.stock} units available for "${product.name}"`, null, 400);
      }

      const subtotal = product.price * cartItem.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        productName: product.name,
        quantity: cartItem.quantity,
        price: product.price,
        subtotal
      });

      // Deduct stock
      product.stock -= cartItem.quantity;
      await product.save({ session });
    }

    // Verify amount matches
    if (Math.round(totalAmount * 100) !== paymentDetails.amount) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Payment amount mismatch', null, 400);
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await Order.create([{
      orderNumber,
      buyerId: userId,
      buyerRole: req.user.role,
      items: orderItems,
      totalAmount,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: 'PAID',
      orderStatus: 'PLACED',
      returnStatus: 'NONE',
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        district: deliveryAddress.district.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim()
      },
      notes: notes ? notes.trim() : undefined
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

    sendResponse(res, true, 'Payment verified and order placed successfully', populatedOrder, 201);
  } catch (error) {
    await session.abortTransaction();
    console.error('Verify payment error:', error);
    sendResponse(res, false, error.message || 'Error verifying payment', null, 500);
  } finally {
    session.endSession();
  }
};

/**
 * @route   POST /api/marketplace/payments/cod
 * @desc    Place Cash on Delivery order
 * @access  Private (Buyer roles only)
 */
exports.createCodOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const {
      deliveryAddress,
      notes
    } = req.body;

    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Access denied. Only buyers can place orders.', null, 403);
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.district ||
        !deliveryAddress.state || !deliveryAddress.pincode) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Complete delivery address is required', null, 400);
    }

    if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Pincode must be 6 digits', null, 400);
    }

    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || !cart.items || cart.items.length === 0) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Cart is empty', null, 400);
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId).session(session);

      if (!product || !product.isActive) {
        await session.abortTransaction();
        return sendResponse(res, false, `Product "${cartItem.productId}" is not available`, null, 400);
      }

      const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
        .select('kycStatus')
        .lean();

      if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
        await session.abortTransaction();
        return sendResponse(res, false, `Product from unverified vendor is not available`, null, 400);
      }

      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        return sendResponse(res, false, `Only ${product.stock} units available for "${product.name}"`, null, 400);
      }

      const subtotal = product.price * cartItem.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        productName: product.name,
        quantity: cartItem.quantity,
        price: product.price,
        subtotal
      });

      product.stock -= cartItem.quantity;
      await product.save({ session });
    }

    if (totalAmount <= 0) {
      await session.abortTransaction();
      return sendResponse(res, false, 'Invalid order amount', null, 400);
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create([{
      orderNumber,
      buyerId: userId,
      buyerRole: req.user.role,
      items: orderItems,
      totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      returnStatus: 'NONE',
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        district: deliveryAddress.district.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim()
      },
      notes: notes ? notes.trim() : undefined
    }], { session });

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order[0]._id)
      .populate('buyerId', 'name email')
      .populate('items.productId', 'name category images')
      .populate('items.vendorId', 'businessName')
      .lean();

    sendResponse(res, true, 'Order placed with Cash on Delivery', populatedOrder, 201);
  } catch (error) {
    await session.abortTransaction();
    console.error('COD order error:', error);
    sendResponse(res, false, error.message || 'Error placing COD order', null, 500);
  } finally {
    session.endSession();
  }
};

