import { useState, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/notifications/count`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-green-50 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-green-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        unreadCount={unreadCount}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
};

export default NotificationBell;