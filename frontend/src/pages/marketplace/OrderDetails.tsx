import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  User,
  Building,
  FileText,
  Mail
} from 'lucide-react';
import ReviewWithPhotos from '../../components/ReviewWithPhotos';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    category: string;
    images: string[];
    description: string;
    warrantyPeriod?: number;
  };
  vendorId: {
    _id: string;
    businessName: string;
  };
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  buyerId: {
    _id: string;
    name: string;
    email: string;
  };
  buyerRole: string;
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
  deliveredAt?: string;
  returnStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  returnReason?: string;
  returnRequestedAt?: string;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [userReviews, setUserReviews] = useState<Record<string, { 
    rating: number; 
    comment?: string; 
    photos?: Array<{ url: string; caption?: string }> 
  }>>({});
  
  // Check if we came from order placement
  const orderPlaced = location.state?.orderPlaced;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        await fetchUserReviews(data.data._id);
      } else {
        console.error('Failed to fetch order:', data.message);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      PLACED: { color: 'bg-blue-100 text-blue-800', icon: Clock, description: 'Order has been placed and is being processed' },
      CONFIRMED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, description: 'Order confirmed by vendor' },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: Package, description: 'Order is being prepared for shipment' },
      SHIPPED: { color: 'bg-purple-100 text-purple-800', icon: Truck, description: 'Order has been shipped and is on the way' },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, description: 'Order has been delivered successfully' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, description: 'Order has been cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLACED;
    const Icon = config.icon;

    return { badge: (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    ), description: config.description };
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
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fertilizers':
        return '🌱';
      case 'Pesticides':
        return '🛡️';
      case 'Equipment & Tools':
        return '🔧';
      default:
        return '📦';
    }
  };

  const fetchUserReviews = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/reviews/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const map: Record<string, { rating: number; comment?: string; photos?: Array<{ url: string; caption?: string }> }> = {};
        data.data.forEach((r: any) => {
          map[r.productId] = { 
            rating: r.rating, 
            comment: r.comment,
            photos: r.photos || []
          };
        });
        setUserReviews(map);
      }
    } catch (err) {
      console.error('Error fetching user reviews', err);
    }
  };

  const canReview = (orderObj: Order) => {
    if (orderObj.orderStatus !== 'DELIVERED' || !orderObj.deliveredAt) return false;
    const days = (Date.now() - new Date(orderObj.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 7;
  };

  const canReturn = (orderObj: Order) => {
    if (orderObj.orderStatus !== 'DELIVERED' || !orderObj.deliveredAt) return false;
    const days = (Date.now() - new Date(orderObj.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    return days < 7; // Return window is only open for first 7 days
  };

  const getDaysUntilReturnExpiry = (orderObj: Order) => {
    if (orderObj.orderStatus !== 'DELIVERED' || !orderObj.deliveredAt) return 0;
    const days = (Date.now() - new Date(orderObj.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 7 - Math.floor(days));
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderStatusInfo = getOrderStatusBadge(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/orders"
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </Link>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              </div>
            </div>
            <button
              onClick={fetchOrder}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Placed Success Message */}
        {orderPlaced && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Order Placed Successfully!</h3>
                <p className="text-green-700">
                  Your order #{order.orderNumber} has been placed and is being processed.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Order #{order.orderNumber}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{order.buyerRole.charAt(0).toUpperCase() + order.buyerRole.slice(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {orderStatusInfo.badge}
                  {/* Only show payment status for non-COD orders or if payment is completed/failed */}
                  {order.orderStatus !== 'DELIVERED' && order.paymentStatus !== 'PENDING' && getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Order Status</p>
                    <p className="text-sm text-blue-700">{orderStatusInfo.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items ({order.items.length})
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={
                            item.productId.images && item.productId.images.length > 0
                              ? `${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000'}${item.productId.images[0]}`
                              : '/placeholder-product.jpg'
                          }
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{getCategoryIcon(item.productId.category)}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {item.productId.category}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{item.productName}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="w-4 h-4" />
                              <span>by {item.vendorId.businessName}</span>
                            </div>
                            {item.productId.warrantyPeriod && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>{item.productId.warrantyPeriod} months warranty</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₹{item.subtotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              ₹{item.price.toLocaleString()} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Section */}
                    {canReview(order) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <ReviewWithPhotos
                          productId={item.productId._id}
                          orderId={order._id}
                          productName={item.productName}
                          onReviewSubmitted={() => fetchUserReviews(order._id)}
                          existingReview={userReviews[item.productId._id] ? {
                            rating: userReviews[item.productId._id].rating,
                            comment: userReviews[item.productId._id].comment,
                            photos: userReviews[item.productId._id].photos
                          } : undefined}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-900">
                  <div className="font-medium">{order.deliveryAddress.street}</div>
                  <div>{order.deliveryAddress.district}, {order.deliveryAddress.state}</div>
                  <div>Pincode: {order.deliveryAddress.pincode}</div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Order Notes</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({order.items.length})</span>
                  <span className="text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-emerald-600">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{order.buyerId.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{order.buyerId.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 capitalize">{order.buyerRole}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">Cash on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <div>
                    {order.orderStatus === 'DELIVERED' && order.paymentStatus === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        Collected on Delivery
                      </span>
                    ) : (
                      getPaymentStatusBadge(order.paymentStatus)
                    )}
                  </div>
                </div>
              </div>

              {order.paymentStatus === 'PENDING' && order.orderStatus !== 'DELIVERED' && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Pending</p>
                      <p className="text-sm text-yellow-700">
                        Payment will be collected upon delivery. Please keep the exact amount ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-xs text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {order.updatedAt !== order.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Return Request */}
            {order.orderStatus === 'DELIVERED' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Returns</h3>
                {order.returnStatus === 'REQUESTED' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    Return requested on {order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleString() : '—'}.
                  </div>
                ) : order.returnStatus === 'APPROVED' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                    Return approved. We will contact you with next steps.
                  </div>
                ) : order.returnStatus === 'REJECTED' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                    Return rejected. Reason: {order.returnReason || 'not specified'}.
                  </div>
                ) : canReturn(order) ? (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium">
                        Return Window Open
                      </p>
                      <p className="text-sm text-blue-700">
                        You have {getDaysUntilReturnExpiry(order)} day{getDaysUntilReturnExpiry(order) !== 1 ? 's' : ''} left to request a return.
                      </p>
                    </div>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      rows={3}
                      placeholder="Reason for return"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      onClick={async () => {
                        if (requestingReturn) return;
                        setRequestingReturn(true);
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(
                            `${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/orders/${order._id}/return-request`,
                            {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ reason: returnReason })
                            }
                          );
                          const data = await response.json();
                          if (data.success) {
                            await fetchOrder();
                          } else {
                            alert(data.message || 'Failed to submit return request');
                          }
                        } catch (error) {
                          console.error('Return request error:', error);
                          alert('Error submitting return request');
                        } finally {
                          setRequestingReturn(false);
                        }
                      }}
                      disabled={requestingReturn}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {requestingReturn ? 'Submitting...' : 'Request Return'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">Return Window Closed</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      The 7-day return window has expired. Returns are no longer available for this order.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Delivered on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;