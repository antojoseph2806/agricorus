const Order = require('../models/Order');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

/**
 * @desc    Get vendor payments with filtering and pagination
 * @route   GET /api/vendor/payments
 * @access  Private (Vendor only)
 */
exports.getVendorPayments = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build query for orders containing this vendor's items
    const query = { 'items.vendorId': vendorId };

    if (status && status !== 'ALL') {
      query.paymentStatus = status.toUpperCase();
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get orders with vendor's items
    const orders = await Order.find(query)
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    // Transform orders to payment format
    const payments = orders.map((order) => {
      // Calculate vendor's portion of the order
      let vendorAmount = 0;
      let itemCount = 0;

      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          vendorAmount += item.subtotal || item.price * item.quantity;
          itemCount++;
        }
      });

      const platformFee = Math.round(vendorAmount * 0.05); // 5% platform fee
      const netAmount = vendorAmount - platformFee;

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderId: {
          _id: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          deliveryAddress: order.deliveryAddress,
          items: order.items.filter(
            (item) => item.vendorId && item.vendorId.toString() === vendorId.toString()
          ),
        },
        buyerId: order.buyerId || { name: 'Guest', email: 'N/A' },
        paymentMethod: order.paymentMethod || 'COD',
        vendorAmount,
        platformFee,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        refundAmount: 0,
        refundStatus: 'NONE',
        settlementStatus: order.paymentStatus === 'PAID' ? 'SETTLED' : 'PENDING',
        paidAt: order.paymentStatus === 'PAID' ? order.updatedAt : null,
        createdAt: order.createdAt,
        netAmount,
      };
    });

    // Calculate summary statistics from all vendor orders
    const allVendorOrders = await Order.find({ 'items.vendorId': vendorId });

    let totalEarnings = 0;
    let totalRefunds = 0;
    let pendingAmount = 0;
    let settledAmount = 0;

    allVendorOrders.forEach((order) => {
      let orderVendorAmount = 0;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          orderVendorAmount += item.subtotal || item.price * item.quantity;
        }
      });

      totalEarnings += orderVendorAmount;

      if (order.paymentStatus === 'PAID') {
        settledAmount += orderVendorAmount;
      } else if (order.paymentStatus === 'PENDING') {
        pendingAmount += orderVendorAmount;
      } else if (order.paymentStatus === 'REFUNDED') {
        totalRefunds += orderVendorAmount;
      }
    });

    const summary = {
      totalEarnings,
      totalRefunds,
      netEarnings: totalEarnings - totalRefunds,
      pendingAmount,
      settledAmount,
    };

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalPayments: totalOrders,
          paymentsPerPage: parseInt(limit),
        },
        summary,
      },
    });
  } catch (error) {
    console.error('Get vendor payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
};


/**
 * @desc    Get single payment details
 * @route   GET /api/vendor/payments/:id
 * @access  Private (Vendor only)
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      'items.vendorId': vendorId,
    })
      .populate('buyerId', 'name email phone')
      .populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Calculate vendor's portion
    let vendorAmount = 0;
    const vendorItems = [];

    order.items.forEach((item) => {
      if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
        vendorAmount += item.subtotal || item.price * item.quantity;
        vendorItems.push(item);
      }
    });

    const platformFee = Math.round(vendorAmount * 0.05);
    const netAmount = vendorAmount - platformFee;

    const payment = {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderId: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        deliveryAddress: order.deliveryAddress,
        items: vendorItems,
        notes: order.notes,
      },
      buyerId: order.buyerId || { name: 'Guest', email: 'N/A' },
      paymentMethod: order.paymentMethod || 'COD',
      vendorAmount,
      platformFee,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      refundAmount: 0,
      refundStatus: 'NONE',
      settlementStatus: order.paymentStatus === 'PAID' ? 'SETTLED' : 'PENDING',
      paidAt: order.paymentStatus === 'PAID' ? order.updatedAt : null,
      createdAt: order.createdAt,
      netAmount,
    };

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
};

/**
 * @desc    Process refund request
 * @route   POST /api/vendor/payments/:id/refund
 * @access  Private (Vendor only)
 */
exports.processRefund = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;

    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required',
      });
    }

    if (!refundReason || refundReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason must be at least 10 characters',
      });
    }

    const order = await Order.findOne({
      _id: id,
      'items.vendorId': vendorId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Only paid orders can be refunded',
      });
    }

    // Calculate vendor's portion
    let vendorAmount = 0;
    order.items.forEach((item) => {
      if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
        vendorAmount += item.subtotal || item.price * item.quantity;
      }
    });

    if (refundAmount > vendorAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum refund amount is ₹${vendorAmount.toFixed(2)}`,
      });
    }

    // Update order payment status
    order.paymentStatus = refundAmount >= vendorAmount ? 'REFUNDED' : 'PAID';
    order.notes = order.notes
      ? `${order.notes}\n\nRefund processed: ₹${refundAmount} - ${refundReason}`
      : `Refund processed: ₹${refundAmount} - ${refundReason}`;

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount,
        status: 'COMPLETED',
      },
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

/**
 * @desc    Get payment analytics
 * @route   GET /api/vendor/payments/analytics
 * @access  Private (Vendor only)
 */
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get orders in period
    const orders = await Order.find({
      'items.vendorId': vendorId,
      createdAt: { $gte: startDate },
    });

    // Daily earnings trend
    const dailyData = {};
    let totalEarnings = 0;
    let totalOrders = 0;
    const paymentMethods = { COD: { count: 0, amount: 0 }, razorpay: { count: 0, amount: 0 } };

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { earnings: 0, refunds: 0, orders: 0 };
      }

      let orderVendorAmount = 0;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          orderVendorAmount += item.subtotal || item.price * item.quantity;
        }
      });

      dailyData[dateKey].earnings += orderVendorAmount;
      dailyData[dateKey].orders++;
      totalEarnings += orderVendorAmount;
      totalOrders++;

      const method = order.paymentMethod || 'COD';
      if (paymentMethods[method]) {
        paymentMethods[method].count++;
        paymentMethods[method].amount += orderVendorAmount;
      }
    });

    const monthlyTrend = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        _id: {
          year: new Date(date).getFullYear(),
          month: new Date(date).getMonth() + 1,
          day: new Date(date).getDate(),
        },
        ...data,
      }));

    const paymentMethodsArray = Object.entries(paymentMethods).map(([method, data]) => ({
      _id: method,
      count: data.count,
      amount: data.amount,
    }));

    res.json({
      success: true,
      data: {
        monthlyTrend,
        paymentMethods: paymentMethodsArray,
        performanceStats: {
          totalOrders,
          totalEarnings,
          totalRefunds: 0,
          avgOrderValue: totalOrders > 0 ? Math.round(totalEarnings / totalOrders) : 0,
          refundRate: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics',
      error: error.message,
    });
  }
};
