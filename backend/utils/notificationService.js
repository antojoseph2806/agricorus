const Notification = require('../models/Notification');
const EmailService = require('./emailService');
const Vendor = require('../models/Vendor');

class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification({
    vendorId,
    type,
    title,
    message,
    data = {},
    priority = 'MEDIUM',
    actionUrl = null,
    actionText = null
  }) {
    try {
      const notification = new Notification({
        vendorId,
        type,
        title,
        message,
        data,
        priority,
        actionUrl,
        actionText
      });

      await notification.save();
      console.log(`Notification created for vendor ${vendorId}: ${type}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create new order notification
   */
  static async notifyNewOrder(vendorId, order) {
    const orderItems = order.items.filter(item => 
      item.vendorId.toString() === vendorId.toString()
    );
    
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return this.createNotification({
      vendorId,
      type: 'NEW_ORDER',
      title: 'New Order Received!',
      message: `You received a new order #${order.orderNumber} for ${itemCount} items worth ₹${totalAmount.toFixed(2)}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount,
        itemCount,
        buyerName: order.buyerId?.name || 'Customer'
      },
      priority: 'HIGH',
      actionUrl: `/vendor/orders`,
      actionText: 'View Order'
    });
  }

  /**
   * Create order cancelled notification
   */
  static async notifyOrderCancelled(vendorId, order) {
    const orderItems = order.items.filter(item => 
      item.vendorId.toString() === vendorId.toString()
    );
    
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    return this.createNotification({
      vendorId,
      type: 'ORDER_CANCELLED',
      title: 'Order Cancelled',
      message: `Order #${order.orderNumber} worth ₹${totalAmount.toFixed(2)} has been cancelled`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount,
        buyerName: order.buyerId?.name || 'Customer'
      },
      priority: 'MEDIUM',
      actionUrl: `/vendor/orders`,
      actionText: 'View Orders'
    });
  }

  /**
   * Create order delivered notification
   */
  static async notifyOrderDelivered(vendorId, order) {
    const orderItems = order.items.filter(item => 
      item.vendorId.toString() === vendorId.toString()
    );
    
    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    return this.createNotification({
      vendorId,
      type: 'ORDER_DELIVERED',
      title: 'Order Delivered Successfully',
      message: `Order #${order.orderNumber} worth ₹${totalAmount.toFixed(2)} has been delivered`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount,
        buyerName: order.buyerId?.name || 'Customer'
      },
      priority: 'LOW',
      actionUrl: `/vendor/orders`,
      actionText: 'View Order'
    });
  }

  /**
   * Create low stock notification
   */
  static async notifyLowStock(vendorId, product) {
    // Create in-app notification
    const notification = await this.createNotification({
      vendorId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: `${product.name} is running low with only ${product.stock} units remaining`,
      data: {
        productId: product._id,
        productName: product.name,
        currentStock: product.stock,
        threshold: product.lowStockThreshold || 10
      },
      priority: 'MEDIUM',
      actionUrl: `/vendor/inventory`,
      actionText: 'Update Stock'
    });

    // Send email alert
    try {
      const vendor = await Vendor.findById(vendorId);
      if (vendor && vendor.email) {
        await EmailService.sendLowStockAlert(
          vendor.email,
          vendor.businessName || vendor.ownerName,
          product
        );
        console.log(`Low stock email sent to ${vendor.email} for product ${product.name}`);
      }
    } catch (emailError) {
      console.error('Failed to send low stock email:', emailError);
      // Don't fail the notification if email fails
    }

    return notification;
  }

  /**
   * Create out of stock notification
   */
  static async notifyOutOfStock(vendorId, product) {
    // Create in-app notification
    const notification = await this.createNotification({
      vendorId,
      type: 'OUT_OF_STOCK',
      title: 'Product Out of Stock',
      message: `${product.name} is now out of stock and unavailable for purchase`,
      data: {
        productId: product._id,
        productName: product.name,
        currentStock: 0
      },
      priority: 'HIGH',
      actionUrl: `/vendor/inventory`,
      actionText: 'Restock Now'
    });

    // Send email alert
    try {
      const vendor = await Vendor.findById(vendorId);
      if (vendor && vendor.email) {
        await EmailService.sendOutOfStockAlert(
          vendor.email,
          vendor.businessName || vendor.ownerName,
          product
        );
        console.log(`Out of stock email sent to ${vendor.email} for product ${product.name}`);
      }
    } catch (emailError) {
      console.error('Failed to send out of stock email:', emailError);
      // Don't fail the notification if email fails
    }

    return notification;
  }

  /**
   * Create stock restored notification
   */
  static async notifyStockRestored(vendorId, product, previousStock, newStock) {
    return this.createNotification({
      vendorId,
      type: 'STOCK_RESTORED',
      title: 'Stock Restored',
      message: `${product.name} stock has been updated from ${previousStock} to ${newStock} units`,
      data: {
        productId: product._id,
        productName: product.name,
        previousStock,
        newStock
      },
      priority: 'LOW',
      actionUrl: `/vendor/inventory`,
      actionText: 'View Inventory'
    });
  }

  /**
   * Create payment received notification
   */
  static async notifyPaymentReceived(vendorId, amount, orderId) {
    return this.createNotification({
      vendorId,
      type: 'PAYMENT_RECEIVED',
      title: 'Payment Received',
      message: `You received a payment of ₹${amount.toFixed(2)} for your order`,
      data: {
        amount,
        orderId
      },
      priority: 'MEDIUM',
      actionUrl: `/vendor/payments`,
      actionText: 'View Payments'
    });
  }

  /**
   * Create KYC approved notification
   */
  static async notifyKycApproved(vendorId) {
    return this.createNotification({
      vendorId,
      type: 'KYC_APPROVED',
      title: 'KYC Verification Approved',
      message: 'Congratulations! Your KYC verification has been approved. You can now sell products.',
      data: {},
      priority: 'HIGH',
      actionUrl: `/vendor/profile`,
      actionText: 'View Profile'
    });
  }

  /**
   * Create KYC rejected notification
   */
  static async notifyKycRejected(vendorId, reason) {
    return this.createNotification({
      vendorId,
      type: 'KYC_REJECTED',
      title: 'KYC Verification Rejected',
      message: `Your KYC verification was rejected. Reason: ${reason}`,
      data: { reason },
      priority: 'HIGH',
      actionUrl: `/vendor/profile`,
      actionText: 'Resubmit KYC'
    });
  }

  /**
   * Create review received notification
   */
  static async notifyReviewReceived(vendorId, productName, rating, reviewText) {
    return this.createNotification({
      vendorId,
      type: 'REVIEW_RECEIVED',
      title: 'New Product Review',
      message: `${productName} received a ${rating}-star review: "${reviewText.substring(0, 50)}..."`,
      data: {
        productName,
        rating,
        reviewText
      },
      priority: 'LOW',
      actionUrl: `/vendor/feedback`,
      actionText: 'View Reviews'
    });
  }

  /**
   * Create system alert notification
   */
  static async notifySystemAlert(vendorId, title, message, priority = 'MEDIUM') {
    return this.createNotification({
      vendorId,
      type: 'SYSTEM_ALERT',
      title,
      message,
      data: {},
      priority,
      actionUrl: `/vendor/dashboard`,
      actionText: 'View Dashboard'
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, vendorId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, vendorId },
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a vendor
   */
  static async markAllAsRead(vendorId) {
    try {
      const result = await Notification.updateMany(
        { vendorId, isRead: false },
        { isRead: true }
      );
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a vendor
   */
  static async getNotifications(vendorId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    try {
      const query = { vendorId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const skip = (page - 1) * limit;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ vendorId, isRead: false });

      return {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;