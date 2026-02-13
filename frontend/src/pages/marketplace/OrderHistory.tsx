import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Eye,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  X,
  RotateCcw,
  Repeat
} from 'lucide-react';
import MarketplaceLayout from '../../components/MarketplaceLayout';

interface OrderItem {
  productId: string;
  vendorId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress: {
    street: string;
    district: string;
    state: string;
    pincode: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string; // Added for proper return window calculation
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://agricorus.duckdns.org/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      PLACED: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      CONFIRMED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: Package },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLACED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      REFUNDED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const canCancelOrder = (order: Order) => {
    return ['PLACED', 'CONFIRMED'].includes(order.orderStatus);
  };

  const canReturnOrder = (order: Order) => {
    if (order.orderStatus !== 'DELIVERED') return false;
    
    // Check if order has deliveredAt date (we need to add this to the interface)
    // For now, we'll use createdAt as a fallback, but ideally we need deliveredAt
    const deliveryDate = order.deliveredAt || order.updatedAt;
    if (!deliveryDate) return false;
    
    const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery < 7; // Return window is only open for first 7 days
  };

  const canReplaceOrder = (order: Order) => {
    if (order.orderStatus !== 'DELIVERED') return false;
    
    // Check if order has deliveredAt date
    const deliveryDate = order.deliveredAt || order.updatedAt;
    if (!deliveryDate) return false;
    
    const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery < 7; // Replace window is also only open for first 7 days
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleReturnOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowReturnModal(true);
  };

  const handleReplaceOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowReplaceModal(true);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Gradient Header Banner - Matching ViewLands */}
        <div className="relative mb-6 sm:mb-8 overflow-hidden">
          <div className="h-40 sm:h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-none sm:rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
                <span>Order History</span>
              </h1>
              <p className="text-sm sm:text-base text-emerald-100">Track and manage your orders</p>
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2">
              <Link to="/marketplace" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition backdrop-blur-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Marketplace</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-emerald-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-50 transition shadow-lg">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Cart</span>
              </Link>
            </div>
          </div>

          {/* Icon Badge */}
          <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mt-12 sm:mt-16 mb-6 sm:mb-8 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Orders</h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">View and manage your order history</p>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {orders.length === 0 ? (
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">No orders yet</h2>
              <p className="text-gray-500 mb-8 text-sm sm:text-base">Start shopping to see your orders here</p>
              <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25">
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Your Orders ({orders.length})
              </h2>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-emerald-600 transition text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all">
                  {/* Order Header */}
                  <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-emerald-50/30 border-b border-gray-200">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          {getOrderStatusBadge(order.orderStatus)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
                        <Link to={`/orders/${order._id}`} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm font-medium">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          View Details
                        </Link>
                        
                        {canCancelOrder(order) && (
                          <button onClick={() => handleCancelOrder(order)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-xs sm:text-sm font-medium">
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            Cancel
                          </button>
                        )}
                        
                        {canReturnOrder(order) && (
                          <button onClick={() => handleReturnOrder(order)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition text-xs sm:text-sm font-medium">
                            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                            Return
                          </button>
                        )}
                        
                        {canReplaceOrder(order) && (
                          <button onClick={() => handleReplaceOrder(order)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition text-xs sm:text-sm font-medium">
                            <Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
                            Replace
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base truncate">{item.productName}</h4>
                            <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                            ₹{item.subtotal.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      
                      {order.items.length > 3 && (
                        <div className="text-xs sm:text-sm text-gray-600 text-center py-2">
                          +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Delivery: </span>
                          {order.deliveryAddress.street}, {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-2">
                        <div className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Notes: </span>
                          {order.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Return Order Modal */}
      {showReturnModal && selectedOrder && (
        <ReturnOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
            setShowReturnModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Replace Order Modal */}
      {showReplaceModal && selectedOrder && (
        <ReplaceOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowReplaceModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
            setShowReplaceModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </MarketplaceLayout>
  );
};

// Cancel Order Modal Component
interface CancelOrderModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const cancelReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery taking too long',
    'Product no longer needed',
    'Other'
  ];

  const handleCancel = async () => {
    if (!reason) {
      alert('Please select a reason for cancellation');
      return;
    }

    if (reason === 'Other' && !customReason.trim()) {
      alert('Please provide a custom reason');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://agricorus.duckdns.org/api/orders/${order._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason === 'Other' ? customReason : reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Order cancelled successfully');
        onSuccess();
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Order #{order.orderNumber} - ₹{order.totalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please select a reason for cancelling this order:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {cancelReasons.map((reasonOption) => (
            <label key={reasonOption} className="flex items-center">
              <input
                type="radio"
                name="reason"
                value={reasonOption}
                checked={reason === reasonOption}
                onChange={(e) => setReason(e.target.value)}
                className="mr-3 text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">{reasonOption}</span>
            </label>
          ))}
        </div>

        {reason === 'Other' && (
          <div className="mb-6">
            <textarea
              placeholder="Please specify your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Keep Order
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Return Order Modal Component
interface ReturnOrderModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const ReturnOrderModal: React.FC<ReturnOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const returnReasons = [
    'Product damaged/defective',
    'Wrong item received',
    'Product not as described',
    'Quality issues',
    'Size/fit issues',
    'Changed my mind',
    'Other'
  ];

  const handleReturn = async () => {
    if (!reason) {
      alert('Please select a reason for return');
      return;
    }

    if (reason === 'Other' && !customReason.trim()) {
      alert('Please provide a custom reason');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://agricorus.duckdns.org/api/orders/${order._id}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason === 'Other' ? customReason : reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Return request submitted successfully');
        onSuccess();
      } else {
        alert(data.message || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      alert('Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Return Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Order #{order.orderNumber} - ₹{order.totalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please select a reason for returning this order:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {returnReasons.map((reasonOption) => (
            <label key={reasonOption} className="flex items-center">
              <input
                type="radio"
                name="reason"
                value={reasonOption}
                checked={reason === reasonOption}
                onChange={(e) => setReason(e.target.value)}
                className="mr-3 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-700">{reasonOption}</span>
            </label>
          ))}
        </div>

        {reason === 'Other' && (
          <div className="mb-6">
            <textarea
              placeholder="Please specify your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={3}
            />
          </div>
        )}

        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Return Policy:</strong> Items can be returned within 7 days of delivery. 
            Return shipping will be arranged by our team.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReturn}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Return'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Replace Order Modal Component
interface ReplaceOrderModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const ReplaceOrderModal: React.FC<ReplaceOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const replaceReasons = [
    'Product damaged/defective',
    'Wrong item received',
    'Product not as described',
    'Quality issues',
    'Size/fit issues',
    'Missing parts/accessories',
    'Other'
  ];

  const handleReplace = async () => {
    if (!reason) {
      alert('Please select a reason for replacement');
      return;
    }

    if (reason === 'Other' && !customReason.trim()) {
      alert('Please provide a custom reason');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://agricorus.duckdns.org/api/orders/${order._id}/replace`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason === 'Other' ? customReason : reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Replacement request submitted successfully');
        onSuccess();
      } else {
        alert(data.message || 'Failed to submit replacement request');
      }
    } catch (error) {
      console.error('Error submitting replacement request:', error);
      alert('Failed to submit replacement request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Replace Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Order #{order.orderNumber} - ₹{order.totalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Please select a reason for replacing this order:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {replaceReasons.map((reasonOption) => (
            <label key={reasonOption} className="flex items-center">
              <input
                type="radio"
                name="reason"
                value={reasonOption}
                checked={reason === reasonOption}
                onChange={(e) => setReason(e.target.value)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{reasonOption}</span>
            </label>
          ))}
        </div>

        {reason === 'Other' && (
          <div className="mb-6">
            <textarea
              placeholder="Please specify your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Replacement Policy:</strong> Items can be replaced within 7 days of delivery. 
            We'll arrange pickup of the defective item and deliver a replacement.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReplace}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Replacement'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;