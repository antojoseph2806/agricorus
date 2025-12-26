const Order = require('../models/Order');
const Product = require('../models/Product');
const NotificationService = require('../utils/notificationService');

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

    // Store previous status for stock management
    const previousStatus = order.orderStatus;
    const newStatus = orderStatus.toUpperCase();

    // Normalize payment status casing to match enum
    if (order.paymentStatus && typeof order.paymentStatus === 'string') {
      order.paymentStatus = order.paymentStatus.toUpperCase();
    }

    // AUTO STOCK REDUCTION LOGIC
    // Reduce stock when order moves to CONFIRMED or PROCESSING (first time)
    if ((newStatus === 'CONFIRMED' || newStatus === 'PROCESSING') && 
        !['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(previousStatus)) {
      
      console.log(`Processing stock reduction for order ${order.orderNumber}`);
      
      // Process stock reduction for vendor's items
      for (const item of order.items) {
        if (item.vendorId.toString() === vendorId) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              const oldStock = product.stock;
              const newStock = Math.max(0, oldStock - item.quantity);
              
              product.stock = newStock;
              await product.save();
              
              console.log(`Stock reduced for ${product.name}: ${oldStock} -> ${newStock} (Qty: ${item.quantity})`);
              
              // Add stock reduction note to order
              const stockNote = `Stock reduced: ${product.name} (${oldStock} -> ${newStock})`;
              order.notes = order.notes 
                ? `${order.notes}\n${stockNote}` 
                : stockNote;

              // Check for low stock or out of stock notifications
              if (newStock === 0) {
                await NotificationService.notifyOutOfStock(vendorId, product);
              } else if (newStock <= (product.lowStockThreshold || 10)) {
                await NotificationService.notifyLowStock(vendorId, product);
              }
            }
          } catch (stockError) {
            console.error(`Failed to reduce stock for product ${item.productId}:`, stockError);
            // Continue processing other items even if one fails
          }
        }
      }
    }

    // STOCK RESTORATION LOGIC (if order is cancelled)
    if (newStatus === 'CANCELLED' && 
        ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(previousStatus)) {
      
      console.log(`Processing stock restoration for cancelled order ${order.orderNumber}`);
      
      // Restore stock for vendor's items
      for (const item of order.items) {
        if (item.vendorId.toString() === vendorId) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              const oldStock = product.stock;
              const newStock = oldStock + item.quantity;
              
              product.stock = newStock;
              await product.save();
              
              console.log(`Stock restored for ${product.name}: ${oldStock} -> ${newStock} (Qty: ${item.quantity})`);
              
              // Add stock restoration note to order
              const stockNote = `Stock restored: ${product.name} (${oldStock} -> ${newStock})`;
              order.notes = order.notes 
                ? `${order.notes}\n${stockNote}` 
                : stockNote;

              // Notify about stock restoration if it was previously out of stock
              if (oldStock === 0 && newStock > 0) {
                await NotificationService.notifyStockRestored(vendorId, product, oldStock, newStock);
              }
            }
          } catch (stockError) {
            console.error(`Failed to restore stock for product ${item.productId}:`, stockError);
            // Continue processing other items even if one fails
          }
        }
      }

      // Send cancellation notification to vendor
      try {
        await NotificationService.notifyOrderCancelled(vendorId, order);
      } catch (notificationError) {
        console.error('Failed to send order cancellation notification:', notificationError);
      }
    }

    // DELIVERY NOTIFICATION
    if (newStatus === 'DELIVERED' && previousStatus !== 'DELIVERED') {
      try {
        await NotificationService.notifyOrderDelivered(vendorId, order);
      } catch (notificationError) {
        console.error('Failed to send order delivery notification:', notificationError);
      }
    }

    // DELIVERY NOTIFICATION
    if (newStatus === 'DELIVERED' && previousStatus !== 'DELIVERED') {
      try {
        await NotificationService.notifyOrderDelivered(vendorId, order);
      } catch (notificationError) {
        console.error('Failed to send order delivered notification:', notificationError);
      }
    }

    // Update order status
    order.orderStatus = newStatus;

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
