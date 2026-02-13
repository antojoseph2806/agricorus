import { useState, useEffect } from "react";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  AlertCircle,
  Edit,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  IndianRupee
} from "lucide-react";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    images?: string[];
  };
  vendorId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface DeliveryAddress {
  street: string;
  district: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  buyerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  buyerRole: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  deliveryAddress: DeliveryAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const VendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: "ALL", label: "All Orders", color: "gray" },
    { value: "PLACED", label: "Placed", color: "blue" },
    { value: "CONFIRMED", label: "Confirmed", color: "green" },
    { value: "PROCESSING", label: "Processing", color: "yellow" },
    { value: "SHIPPED", label: "Shipped", color: "purple" },
    { value: "DELIVERED", label: "Delivered", color: "green" },
    { value: "CANCELLED", label: "Cancelled", color: "red" }
  ];

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = selectedStatus !== "ALL" ? { status: selectedStatus } : {};
      
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string) => {
    if (!newStatus) {
      alert("Please select a status");
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.patch(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/orders/${orderId}/status`,
        {
          orderStatus: newStatus,
          statusDescription: statusDescription.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert("Order status updated successfully!");
        setEditingOrder(null);
        setNewStatus("");
        setStatusDescription("");
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PLACED":
        return <Clock className="w-5 h-5" />;
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5" />;
      case "PROCESSING":
        return <Package className="w-5 h-5" />;
      case "SHIPPED":
        return <Truck className="w-5 h-5" />;
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateVendorTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">View and manage orders for your products</p>
        </div>

        {/* Status Filter */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
                selectedStatus === status.value
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              {selectedStatus === "ALL"
                ? "You haven't received any orders yet."
                : `No orders with status "${selectedStatus}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        {order.orderNumber}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center space-x-1 flex-shrink-0 ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="truncate">{order.orderStatus}</span>
                    </span>
                    
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                    >
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrder === order._id && (
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* Customer Information */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <p className="text-gray-700 truncate">
                          <strong>Name:</strong> {order.buyerId.name}
                        </p>
                        <p className="text-gray-700 flex items-center gap-2 min-w-0">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{order.buyerId.email}</span>
                        </p>
                        {order.buyerId.phone && (
                          <p className="text-gray-700 flex items-center gap-2">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{order.buyerId.phone}</span>
                          </p>
                        )}
                        <p className="text-gray-700">
                          <strong>Role:</strong> {order.buyerRole}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Delivery Address
                      </h4>
                      <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                        <p>{order.deliveryAddress.street}</p>
                        <p>{order.deliveryAddress.district}</p>
                        <p>{order.deliveryAddress.state}</p>
                        <p><strong>Pincode:</strong> {order.deliveryAddress.pincode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 sm:mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Order Items</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1 w-full sm:w-auto">
                            {item.productId?.images?.[0] && (
                              <img
                                src={`${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}${item.productId.images[0]}`}
                                alt={item.productName}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.productName}</p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right w-full sm:w-auto">
                            <p className="font-semibold text-gray-800 flex items-center justify-end text-sm sm:text-base">
                              <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                              {item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-semibold text-gray-800">Your Total:</span>
                        <span className="text-lg sm:text-xl font-bold text-green-600 flex items-center">
                          <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                          {calculateVendorTotal(order.items).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Order Notes & History</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{order.notes}</p>
                    </div>
                  )}

                  {/* Update Status Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {editingOrder === order._id ? (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <Edit className="w-5 h-5 mr-2" />
                          Update Order Status
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status
                          </label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select Status</option>
                            {statusOptions.slice(1).map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description / Notes (Optional)
                          </label>
                          <textarea
                            value={statusDescription}
                            onChange={(e) => setStatusDescription(e.target.value)}
                            placeholder="Add any notes about this status update..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdateStatus(order._id)}
                            disabled={updating}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrder(null);
                              setNewStatus("");
                              setStatusDescription("");
                            }}
                            disabled={updating}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingOrder(order._id);
                          setNewStatus(order.orderStatus);
                        }}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Edit className="w-5 h-5" />
                        <span>Update Order Status</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;
