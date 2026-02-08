const SupportQuery = require('../models/SupportQuery');
const { sendResponse } = require('../utils/responseHelper');

/**
 * Get support messages for a user
 */
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, productId } = req.query;

    const query = { userId };
    if (orderId) query.orderId = orderId;
    if (productId) query.productId = productId;

    const supportQuery = await SupportQuery.findOne(query)
      .populate('vendorId', 'businessName')
      .sort({ lastMessageAt: -1 });

    if (!supportQuery) {
      return sendResponse(res, true, 'No messages found', []);
    }

    sendResponse(res, true, 'Messages retrieved successfully', supportQuery.messages);
  } catch (error) {
    console.error('Get user messages error:', error);
    sendResponse(res, false, 'Failed to retrieve messages', null, 500);
  }
};

/**
 * Send a message from user to vendor
 */
exports.sendUserMessage = async (req, res) => {
  try {
    console.log('📨 Send user message request:', {
      userId: req.user.id,
      userRole: req.user.role,
      body: req.body
    });

    const userId = req.user.id;
    const userRole = req.user.role;
    const { orderId, productId, vendorId, message } = req.body;

    if (!message || !message.trim()) {
      console.log('❌ Empty message');
      return sendResponse(res, false, 'Message cannot be empty', null, 400);
    }

    if (!vendorId) {
      console.log('❌ Missing vendor ID');
      return sendResponse(res, false, 'Vendor ID is required', null, 400);
    }

    // Find existing query or create new one
    let supportQuery = await SupportQuery.findOne({
      userId,
      vendorId,
      ...(orderId && { orderId }),
      ...(productId && { productId })
    });

    console.log('🔍 Existing query:', supportQuery ? 'Found' : 'Not found');

    if (!supportQuery) {
      supportQuery = new SupportQuery({
        userId,
        userRole,
        vendorId,
        orderId,
        productId,
        messages: [],
        status: 'open'
      });
      console.log('✨ Creating new support query');
    }

    // Add message
    supportQuery.messages.push({
      message: message.trim(),
      sender: 'user',
      timestamp: new Date()
    });

    supportQuery.lastMessageAt = new Date();
    supportQuery.status = 'open';

    await supportQuery.save();
    console.log('✅ Message saved successfully');

    sendResponse(res, true, 'Message sent successfully', supportQuery.messages);
  } catch (error) {
    console.error('❌ Send user message error:', error);
    sendResponse(res, false, 'Failed to send message: ' + error.message, null, 500);
  }
};

/**
 * Get all support queries for a vendor
 */
exports.getVendorQueries = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { status } = req.query;

    const query = { vendorId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const queries = await SupportQuery.find(query)
      .populate('userId', 'name email')
      .populate('orderId', 'orderNumber')
      .populate('productId', 'name')
      .sort({ lastMessageAt: -1 });

    sendResponse(res, true, 'Queries retrieved successfully', queries);
  } catch (error) {
    console.error('Get vendor queries error:', error);
    sendResponse(res, false, 'Failed to retrieve queries', null, 500);
  }
};

/**
 * Send a reply from vendor to user
 */
exports.sendVendorReply = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { queryId, message } = req.body;

    if (!message || !message.trim()) {
      return sendResponse(res, false, 'Message cannot be empty', null, 400);
    }

    const supportQuery = await SupportQuery.findOne({
      _id: queryId,
      vendorId
    });

    if (!supportQuery) {
      return sendResponse(res, false, 'Query not found', null, 404);
    }

    supportQuery.messages.push({
      message: message.trim(),
      sender: 'vendor',
      timestamp: new Date()
    });

    supportQuery.lastMessageAt = new Date();
    supportQuery.status = 'in_progress';

    await supportQuery.save();

    sendResponse(res, true, 'Reply sent successfully', supportQuery);
  } catch (error) {
    console.error('Send vendor reply error:', error);
    sendResponse(res, false, 'Failed to send reply', null, 500);
  }
};

/**
 * Update query status
 */
exports.updateQueryStatus = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { queryId, status } = req.body;

    const supportQuery = await SupportQuery.findOne({
      _id: queryId,
      vendorId
    });

    if (!supportQuery) {
      return sendResponse(res, false, 'Query not found', null, 404);
    }

    supportQuery.status = status;
    await supportQuery.save();

    sendResponse(res, true, 'Status updated successfully', supportQuery);
  } catch (error) {
    console.error('Update query status error:', error);
    sendResponse(res, false, 'Failed to update status', null, 500);
  }
};
