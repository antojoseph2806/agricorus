const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Razorpay = require('razorpay');
const NotificationService = require('../utils/notificationService');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Get vendor payments with filtering and pagination
 * @route   GET /api/vendor/payments
 * @access  Private (Vendor only)
 */
exports.getVendorPayments = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentMethod, 
      startDate, 
      endDate,
      search 
    } = req.query;

    // Build query
    const query = { vendorId };

    if (status) {
      query.paymentStatus = status.toUpperCase();
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payments with populated data
    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber orderStatus deliveryAddress items')
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(query);

    // Calculate summary statistics
    const summaryPipeline = [
      { $match: { vendorId: require('mongoose').Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$vendorAmount' },
          totalRefunds: { $sum: '$refundAmount' },
          netEarnings: { $sum: { $subtract: ['$vendorAmount', '$refundAmount'] } },
          pendingAmount: {
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'PENDING'] },
                '$vendorAmount',
                0
              ]
            }
          },
          settledAmount: {
            $sum: {
              $cond: [
                { $eq: ['$settlementStatus', 'SETTLED'] },
                '$vendorAmount',
                0
              ]
            }
          }
        }
      }
    ];

    const summaryResult = await Payment.aggregate(summaryPipeline);
    const summary = summaryResult[0] || {
      totalEarnings: 0,
      totalRefunds: 0,
      netEarnings: 0,
      pendingAmount: 0,
      settledAmount: 0
    };

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / parseInt(limit)),
          totalPayments,
          paymentsPerPage: parseInt(limit)
        },
        summary
      }
    });
  } catch (error) {
    console.error('Get vendor payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
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
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { id } = req.params;

    const payment = await Payment.findOne({ _id: id, vendorId })
      .populate('orderId', 'orderNumber orderStatus deliveryAddress items notes')
      .populate('buyerId', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
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
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;

    // Validate input
    if (!refundAmount || refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid refund amount is required'
      });
    }

    if (!refundReason || refundReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason must be at least 10 characters'
      });
    }

    const payment = await Payment.findOne({ _id: id, vendorId })
      .populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Validate refund amount
    const maxRefundAmount = payment.vendorAmount - payment.refundAmount;
    if (refundAmount > maxRefundAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum refund amount is ₹${maxRefundAmount.toFixed(2)}`
      });
    }

    // Check if payment can be refunded
    if (payment.paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Only paid orders can be refunded'
      });
    }

    if (payment.refundStatus === 'PROCESSING') {
      return res.status(400).json({
        success: false,
        message: 'Refund is already being processed'
      });
    }

    // Update payment with refund request
    payment.refundStatus = 'REQUESTED';
    payment.refundAmount = (payment.refundAmount || 0) + refundAmount;
    payment.refundReason = refundReason.trim();
    payment.refundRequestedBy = 'VENDOR';
    payment.refundRequestedAt = new Date();
    payment.notes = payment.notes 
      ? `${payment.notes}\n\nRefund requested by vendor: ${refundReason}` 
      : `Refund requested by vendor: ${refundReason}`;

    await payment.save();

    // Process refund through Razorpay if it's an online payment
    if (payment.paymentMethod === 'razorpay' && payment.razorpayPaymentId) {
      try {
        payment.refundStatus = 'PROCESSING';
        await payment.save();

        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100), // Convert to paise
          notes: {
            reason: refundReason,
            orderId: payment.orderId._id.toString(),
            vendorId: vendorId
          }
        });

        // Update payment with refund details
        payment.razorpayRefundId = refund.id;
        payment.refundStatus = 'COMPLETED';
        payment.refundedAt = new Date();
        payment.paymentGatewayResponse = refund;

        // Update order payment status if fully refunded
        if (payment.refundAmount >= payment.vendorAmount) {
          payment.paymentStatus = 'REFUNDED';
          await Order.findByIdAndUpdate(payment.orderId._id, {
            paymentStatus: 'REFUNDED'
          });
        } else {
          payment.paymentStatus = 'PARTIALLY_REFUNDED';
        }

        await payment.save();

        // Send notification to buyer
        try {
          await NotificationService.createNotification({
            vendorId: payment.buyerId,
            type: 'REFUND_PROCESSED',
            title: 'Refund Processed',
            message: `Your refund of ₹${refundAmount.toFixed(2)} for order ${payment.orderNumber} has been processed`,
            data: {
              orderId: payment.orderId._id,
              orderNumber: payment.orderNumber,
              refundAmount
            },
            priority: 'MEDIUM'
          });
        } catch (notificationError) {
          console.error('Failed to send refund notification:', notificationError);
        }

        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: {
            refundId: refund.id,
            refundAmount,
            status: 'COMPLETED'
          }
        });
      } catch (refundError) {
        console.error('Razorpay refund error:', refundError);
        
        // Update payment status to failed
        payment.refundStatus = 'FAILED';
        payment.notes = payment.notes 
          ? `${payment.notes}\n\nRefund failed: ${refundError.message}` 
          : `Refund failed: ${refundError.message}`;
        await payment.save();

        res.status(500).json({
          success: false,
          message: 'Failed to process refund through payment gateway',
          error: refundError.message
        });
      }
    } else {
      // For COD orders, mark as completed (manual process)
      payment.refundStatus = 'COMPLETED';
      payment.refundedAt = new Date();
      payment.paymentStatus = payment.refundAmount >= payment.vendorAmount 
        ? 'REFUNDED' 
        : 'PARTIALLY_REFUNDED';
      
      await payment.save();

      res.json({
        success: true,
        message: 'Refund request submitted successfully. COD refunds will be processed manually.',
        data: {
          refundAmount,
          status: 'COMPLETED'
        }
      });
    }
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
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
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Monthly earnings trend
    const monthlyTrend = await Payment.aggregate([
      {
        $match: {
          vendorId: require('mongoose').Types.ObjectId(vendorId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          earnings: { $sum: '$vendorAmount' },
          refunds: { $sum: '$refundAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Payment method breakdown
    const paymentMethods = await Payment.aggregate([
      {
        $match: {
          vendorId: require('mongoose').Types.ObjectId(vendorId),
          paymentStatus: 'PAID'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$vendorAmount' }
        }
      }
    ]);

    // Top performing periods
    const performanceStats = await Payment.aggregate([
      {
        $match: {
          vendorId: require('mongoose').Types.ObjectId(vendorId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalEarnings: { $sum: '$vendorAmount' },
          totalRefunds: { $sum: '$refundAmount' },
          avgOrderValue: { $avg: '$vendorAmount' },
          refundRate: {
            $avg: {
              $cond: [
                { $gt: ['$refundAmount', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        monthlyTrend,
        paymentMethods,
        performanceStats: performanceStats[0] || {
          totalOrders: 0,
          totalEarnings: 0,
          totalRefunds: 0,
          avgOrderValue: 0,
          refundRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Get payment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment analytics',
      error: error.message
    });
  }
};