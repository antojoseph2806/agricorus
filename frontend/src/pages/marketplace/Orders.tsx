import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Package, 
  CheckCircle2,
  Clock,
  XCircle,
  Eye
} from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);

    if (!role || !["farmer", "landowner"].includes(role)) {
      alert("Please login as Farmer or Landowner to view orders");
      navigate("/login");
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        alert("Please login to view orders");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLACED":
        return { label: "Placed", color: "bg-blue-100 text-blue-800", icon: Clock };
      case "CONFIRMED":
        return { label: "Confirmed", color: "bg-green-100 text-green-800", icon: CheckCircle2 };
      case "DELIVERED":
        return { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle2 };
      case "CANCELLED":
        return { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate("/marketplace")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.orderStatus);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusBadge.color} self-start`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-xs sm:text-sm text-gray-700">
                          {item.productName} × {item.quantity}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs sm:text-sm text-gray-500">
                          +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

