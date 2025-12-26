const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const vendorAuth = require('../middleware/vendorAuth');

// Apply vendor authentication to all routes
router.use(vendorAuth);

// @route   GET /api/vendor/notifications
// @desc    Get notifications for vendor
// @access  Private (Vendor only)
router.get('/', getNotifications);

// @route   GET /api/vendor/notifications/count
// @desc    Get unread notification count
// @access  Private (Vendor only)
router.get('/count', getUnreadCount);

// @route   PATCH /api/vendor/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private (Vendor only)
router.patch('/read-all', markAllAsRead);

// @route   PATCH /api/vendor/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Vendor only)
router.patch('/:id/read', markAsRead);

// @route   DELETE /api/vendor/notifications/:id
// @desc    Delete notification
// @access  Private (Vendor only)
router.delete('/:id', deleteNotification);

module.exports = router;