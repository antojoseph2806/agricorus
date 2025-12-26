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

      const response = await fetch('http://localhost:5000/api/orders', {
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
    return order.orderStatus === 'DELIVERED';
  };

  const canReplaceOrder = (order: Order) => {
    return order.orderStatus === 'DELIVERED';
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/marketplace"
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Link>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/cart"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
              </Link>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Orders ({orders.length})
              </h2>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          {getOrderStatusBadge(order.orderStatus)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            <span>₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/orders/${order._id}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                        
                        {/* Action Buttons */}
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                        
                        {canReturnOrder(order) && (
                          <button
                            onClick={() => handleReturnOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Return
                          </button>
                        )}
                        
                        {canReplaceOrder(order) && (
                          <button
                            onClick={() => handleReplaceOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                          >
                            <Repeat className="w-4 h-4" />
                            Replace
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ₹{item.subtotal.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-600 text-center py-2">
                          +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Delivery Address: </span>
                          {order.deliveryAddress.street}, {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
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
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/cancel`, {
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
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/return`, {
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
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/replace`, {
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