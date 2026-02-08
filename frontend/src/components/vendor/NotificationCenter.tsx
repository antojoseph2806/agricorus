import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  TrendingDown,
  Star,
  CreditCard,
  Shield,
  Settings,
  ExternalLink,
  Clock
} from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  priority: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  age: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

const NotificationCenter = ({ isOpen, onClose, unreadCount, onUnreadCountChange }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            unreadOnly: filter === 'unread',
            limit: 50
          }
        }
      );

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        onUnreadCountChange(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );

      // Update unread count
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      onUnreadCountChange(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));

      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingCart className="w-5 h-5 text-green-600" />;
      case 'ORDER_CANCELLED':
        return <X className="w-5 h-5 text-red-600" />;
      case 'ORDER_DELIVERED':
        return <Check className="w-5 h-5 text-blue-600" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'OUT_OF_STOCK':
        return <Package className="w-5 h-5 text-red-600" />;
      case 'STOCK_RESTORED':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'KYC_APPROVED':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'KYC_REJECTED':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'REVIEW_RECEIVED':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'SYSTEM_ALERT':
        return <Settings className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-red-500 bg-red-50';
      case 'HIGH':
        return 'border-l-orange-500 bg-orange-50';
      case 'MEDIUM':
        return 'border-l-blue-500 bg-blue-50';
      case 'LOW':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-white';
    }
  };

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      // Mark as read when action is clicked
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
      
      // Navigate to action URL
      window.location.href = notification.actionUrl;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700 flex items-center"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Bell className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {notification.age}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 hover:bg-gray-200 rounded text-green-600"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 hover:bg-gray-200 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Action Button */}
                      {notification.actionUrl && notification.actionText && (
                        <button
                          onClick={() => handleActionClick(notification)}
                          className="mt-2 inline-flex items-center text-sm text-green-600 hover:text-green-700"
                        >
                          {notification.actionText}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;