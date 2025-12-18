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
 * Helper function to get or create cart
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private (Farmer/Landowner only)
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can access cart.', null, 403);
    }

    const cart = await getOrCreateCart(userId);

    // Populate product details
    const cartItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId)
          .populate('vendorId', 'businessName')
          .lean();

        if (!product) {
          return null;
        }

        // Check if vendor is verified
        const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
          .select('kycStatus')
          .lean();

        if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
          return null;
        }

        return {
          productId: item.productId,
          productName: product.name,
          category: product.category,
          price: product.price,
          priceAtAddTime: item.priceAtAddTime,
          quantity: item.quantity,
          stock: product.stock,
          image: product.images && product.images.length > 0 ? product.images[0] : null,
          vendorId: product.vendorId,
          vendorBusinessName: product.vendorId?.businessName || 'Unknown',
          subtotal: item.priceAtAddTime * item.quantity,
          isAvailable: product.isActive && product.stock > 0,
          maxQuantity: Math.min(item.quantity, product.stock) // Current stock limit
        };
      })
    );

    // Filter out null items (removed products or unverified vendors)
    const validItems = cartItems.filter(item => item !== null);

    // Calculate totals
    const subtotal = validItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

    sendResponse(res, true, 'Cart retrieved successfully', {
      items: validItems,
      subtotal,
      totalItems,
      itemCount: validItems.length
    });
  } catch (error) {
    console.error('Get cart error:', error);
    sendResponse(res, false, 'Error retrieving cart', null, 500);
  }
};

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private (Farmer/Landowner only)
 */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can add to cart.', null, 403);
    }

    // Validation
    if (!productId || !quantity) {
      return sendResponse(res, false, 'Product ID and quantity are required', null, 400);
    }

    if (!isValidObjectId(productId)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return sendResponse(res, false, 'Quantity must be a positive integer', null, 400);
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, false, 'Product not found', null, 404);
    }

    // Check if product is active
    if (!product.isActive) {
      return sendResponse(res, false, 'Product is not available', null, 400);
    }

    // Check if vendor is verified
    const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
      .select('kycStatus')
      .lean();

    if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
      return sendResponse(res, false, 'Product from unverified vendor is not available', null, 400);
    }

    // Check stock
    if (product.stock < quantity) {
      return sendResponse(res, false, `Only ${product.stock} units available in stock`, null, 400);
    }

    // Get or create cart
    const cart = await getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return sendResponse(res, false, `Only ${product.stock} units available in stock`, null, 400);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].priceAtAddTime = product.price; // Update price
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        priceAtAddTime: product.price
      });
    }

    await cart.save();

    sendResponse(res, true, 'Item added to cart successfully', {
      cartItem: existingItemIndex !== -1 ? cart.items[existingItemIndex] : cart.items[cart.items.length - 1],
      totalItems: cart.items.length
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    sendResponse(res, false, error.message || 'Error adding item to cart', null, 500);
  }
};

/**
 * @route   PATCH /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private (Farmer/Landowner only)
 */
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can update cart.', null, 403);
    }

    // Validation
    if (!productId || quantity === undefined) {
      return sendResponse(res, false, 'Product ID and quantity are required', null, 400);
    }

    if (!isValidObjectId(productId)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    if (quantity < 0 || !Number.isInteger(quantity)) {
      return sendResponse(res, false, 'Quantity must be a non-negative integer', null, 400);
    }

    // Get cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return sendResponse(res, false, 'Cart not found', null, 404);
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return sendResponse(res, false, 'Item not found in cart', null, 404);
    }

    // If quantity is 0, remove item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return sendResponse(res, true, 'Item removed from cart', { cart });
    }

    // Find product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, false, 'Product not found', null, 404);
    }

    // Check stock
    if (product.stock < quantity) {
      return sendResponse(res, false, `Only ${product.stock} units available in stock`, null, 400);
    }

    // Check if product is still active
    if (!product.isActive) {
      return sendResponse(res, false, 'Product is no longer available', null, 400);
    }

    // Update item
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceAtAddTime = product.price; // Update price

    await cart.save();

    sendResponse(res, true, 'Cart item updated successfully', {
      cartItem: cart.items[itemIndex],
      totalItems: cart.items.length
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    sendResponse(res, false, error.message || 'Error updating cart item', null, 500);
  }
};

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Remove item from cart
 * @access  Private (Farmer/Landowner only)
 */
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Verify role
    if (!['farmer', 'landowner', 'investor'].includes(req.user.role)) {
      return sendResponse(res, false, 'Access denied. Only farmers, landowners, and investors can remove from cart.', null, 403);
    }

    // Validate ObjectId
    if (!isValidObjectId(productId)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Get cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return sendResponse(res, false, 'Cart not found', null, 404);
    }

    // Find and remove item
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return sendResponse(res, false, 'Item not found in cart', null, 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    sendResponse(res, true, 'Item removed from cart successfully', {
      totalItems: cart.items.length
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    sendResponse(res, false, 'Error removing item from cart', null, 500);
  }
};

