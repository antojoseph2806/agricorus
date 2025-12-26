const NotificationService = require('../utils/notificationService');

/**
 * @desc    Get notifications for vendor
 * @route   GET /api/vendor/notifications
 * @access  Private (Vendor only)
 */
exports.getNotifications = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const result = await NotificationService.getNotifications(vendorId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

/**
 * @desc    Get unread notification count
 * @route   GET /api/vendor/notifications/count
 * @access  Private (Vendor only)
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    
    const result = await NotificationService.getNotifications(vendorId, { limit: 1 });

    res.json({
      success: true,
      data: {
        unreadCount: result.unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/vendor/notifications/:id/read
 * @access  Private (Vendor only)
 */
exports.markAsRead = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(id, vendorId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/vendor/notifications/read-all
 * @access  Private (Vendor only)
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();

    const result = await NotificationService.markAllAsRead(vendorId);

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: result
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/vendor/notifications/:id
 * @access  Private (Vendor only)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { id } = req.params;

    const Notification = require('../models/Notification');
    const notification = await Notification.findOneAndDelete({
      _id: id,
      vendorId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};