const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  checkout,
  getUserOrders,
  getOrderDetails,
  requestReturn,
  cancelOrder,
  returnOrder,
  replaceOrder
} = require('../controllers/orderController');
const Order = require('../models/Order');
const generateInvoicePDF = require('../utils/generateInvoicePDF');

/**
 * @route   POST /api/orders/checkout
 * @desc    Create order from cart
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/checkout', auth, authorizeRoles('farmer', 'landowner', 'investor'), checkout);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.get('/', auth, authorizeRoles('farmer', 'landowner', 'investor'), getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.get('/:id', auth, authorizeRoles('farmer', 'landowner', 'investor'), getOrderDetails);

/**
 * @route   POST /api/orders/:id/return-request
 * @desc    Buyer requests return within 7 days of delivery
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/:id/return-request', auth, authorizeRoles('farmer', 'landowner', 'investor'), requestReturn);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order (only if PLACED or CONFIRMED)
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.put('/:id/cancel', auth, authorizeRoles('farmer', 'landowner', 'investor'), cancelOrder);

/**
 * @route   POST /api/orders/:id/return
 * @desc    Request a return for delivered order
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/:id/return', auth, authorizeRoles('farmer', 'landowner', 'investor'), returnOrder);

/**
 * @route   POST /api/orders/:id/replace
 * @desc    Request a replacement for delivered order
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.post('/:id/replace', auth, authorizeRoles('farmer', 'landowner', 'investor'), replaceOrder);

/**
 * @route   GET /api/orders/:id/invoice
 * @desc    Download invoice PDF for delivered order (after return period)
 * @access  Private (Farmer/Landowner/Investor only)
 */
router.get('/:id/invoice', auth, authorizeRoles('farmer', 'landowner', 'investor'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email phone')
      .populate('items.vendorId', 'businessName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify the order belongs to the requesting user
    if (order.buyerId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
    }

    // Check if order is delivered
    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Invoice is only available for delivered orders' });
    }

    // Check if return period (7 days) is over
    if (order.deliveredAt) {
      const daysSinceDelivery = (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery < 7) {
        return res.status(400).json({ 
          success: false, 
          message: `Invoice will be available after the 7-day return period. ${Math.ceil(7 - daysSinceDelivery)} days remaining.` 
        });
      }
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order, order.buyerId);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice' });
  }
});

module.exports = router;

