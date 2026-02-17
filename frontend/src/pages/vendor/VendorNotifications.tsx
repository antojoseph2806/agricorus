import { useState, useEffect } from "react";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import { 
  Bell, 
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
  Clock,
  Filter,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const VendorNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'orders' | 'stock' | 'system'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            unreadOnly: filter === 'unread',
            limit: 100
          }
        }
      );

      if (response.data.success) {
        let filteredNotifications = response.data.data.notifications;
        
        // Apply type filters
        if (filter === 'orders') {
          filteredNotifications = filteredNotifications.filter((n: Notification) => 
            ['NEW_ORDER', 'ORDER_CANCELLED', 'ORDER_DELIVERED', 'PAYMENT_RECEIVED'].includes(n.type)
          );
        } else if (filter === 'stock') {
          filteredNotifications = filteredNotifications.filter((n: Notification) => 
            ['LOW_STOCK', 'OUT_OF_STOCK', 'STOCK_RESTORED'].includes(n.type)
          );
        } else if (filter === 'system') {
          filteredNotifications = filteredNotifications.filter((n: Notification) => 
            ['KYC_APPROVED', 'KYC_REJECTED', 'SYSTEM_ALERT', 'REVIEW_RECEIVED'].includes(n.type)
          );
        }
        
        setNotifications(filteredNotifications);
        setUnreadCount(response.data.data.unreadCount);
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
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_ORDER':
        return <ShoppingCart className="w-6 h-6 text-green-600" />;
      case 'ORDER_CANCELLED':
        return <ShoppingCart className="w-6 h-6 text-red-600" />;
      case 'ORDER_DELIVERED':
        return <Check className="w-6 h-6 text-blue-600" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'OUT_OF_STOCK':
        return <Package className="w-6 h-6 text-red-600" />;
      case 'STOCK_RESTORED':
        return <TrendingDown className="w-6 h-6 text-green-600" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="w-6 h-6 text-green-600" />;
      case 'KYC_APPROVED':
        return <Shield className="w-6 h-6 text-green-600" />;
      case 'KYC_REJECTED':
        return <Shield className="w-6 h-6 text-red-600" />;
      case 'REVIEW_RECEIVED':
        return <Star className="w-6 h-6 text-yellow-600" />;
      case 'SYSTEM_ALERT':
        return <Settings className="w-6 h-6 text-blue-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
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
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
      navigate(notification.actionUrl);
    }
  };

  return (
    <VendorLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center">
              <Bell className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-green-600" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Stay updated with your business activities</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', icon: Bell },
                { id: 'unread', label: 'Unread', icon: Filter },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'stock', label: 'Inventory', icon: Package },
                { id: 'system', label: 'System', icon: Settings }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filter === filterOption.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <filterOption.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{filterOption.label}</span>
                  <span className="sm:hidden">{filterOption.label.slice(0, 3)}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchNotifications}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                >
                  <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">Mark Read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications found</h3>
              <p className="text-sm">
                {filter === 'unread' 
                  ? 'You have no unread notifications' 
                  : 'Notifications will appear here when you have new activities'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 sm:p-4 lg:p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm sm:text-base lg:text-lg font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="flex flex-wrap items-center mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 gap-2">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {notification.age}
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              notification.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.priority}
                            </span>
                          </div>

                          {/* Action Button */}
                          {notification.actionUrl && notification.actionText && (
                            <button
                              onClick={() => handleActionClick(notification)}
                              className="mt-2 sm:mt-3 inline-flex items-center text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              {notification.actionText}
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-lg text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorNotifications;