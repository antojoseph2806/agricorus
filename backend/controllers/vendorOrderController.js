const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Get all orders containing vendor's products
 * @route   GET /api/vendor/orders
 * @access  Private (Vendor only)
 */
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { status, page = 1, limit = 10 } = req.query;

    // Build query to find orders containing vendor's products
    const query = {
      'items.vendorId': vendorId
    };

    if (status) {
      query.orderStatus = status.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('buyerId', 'name email phone')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter items to only show vendor's products
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        item => item.vendorId.toString() === vendorId
      );
      return orderObj;
    });

    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      orders: filteredOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        ordersPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get single order details for vendor
 * @route   GET /api/vendor/orders/:id
 * @access  Private (Vendor only)
 */
exports.getVendorOrderDetails = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name email phone')
      .populate('items.productId', 'name images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if vendor has products in this order
    const hasVendorProducts = order.items.some(
      item => item.vendorId.toString() === vendorId
    );

    if (!hasVendorProducts) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this order'
      });
    }

    // Filter to show only vendor's products
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(
      item => item.vendorId.toString() === vendorId
    );

    res.json({
      success: true,
      order: orderObj
    });
  } catch (error) {
    console.error('Get vendor order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

/**
 * @desc    Update order status with description
 * @route   PATCH /api/vendor/orders/:id/status
 * @access  Private (Vendor only)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const orderId = req.params.id;
    const { orderStatus, statusDescription } = req.body;

    // Validate status
    const validStatuses = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!orderStatus || !validStatuses.includes(orderStatus.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status. Valid statuses: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if vendor has products in this order
    const hasVendorProducts = order.items.some(
      item => item.vendorId.toString() === vendorId
    );

    if (!hasVendorProducts) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this order'
      });
    }

    // Normalize payment status casing to match enum
    if (order.paymentStatus && typeof order.paymentStatus === 'string') {
      order.paymentStatus = order.paymentStatus.toUpperCase();
    }

    // Update order status
    order.orderStatus = orderStatus.toUpperCase();

    // Track delivery timestamp
    if (order.orderStatus === 'DELIVERED' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    
    // Add status description to notes (append if notes exist)
    if (statusDescription) {
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const statusUpdate = `[${timestamp}] Status updated to ${orderStatus.toUpperCase()}\n${statusDescription}`;
      order.notes = order.notes 
        ? `${order.notes}\n\n${statusUpdate}` 
        : statusUpdate;
    } else {
      // Even without description, log the status change
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const statusUpdate = `[${timestamp}] Status updated to ${orderStatus.toUpperCase()}`;
      order.notes = order.notes 
        ? `${order.notes}\n\n${statusUpdate}` 
        : statusUpdate;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        notes: order.notes
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};
