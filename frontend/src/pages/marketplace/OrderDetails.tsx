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
  Loader2,
  User,
  Building,
  FileText,
  Mail,
  Download,
  Shield,
  CreditCard,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import MarketplaceLayout from '../../components/MarketplaceLayout';
import ReviewWithPhotos from '../../components/ReviewWithPhotos';
import SupportChat from '../../components/marketplace/SupportChat';

interface OrderItem {
  productId: { _id: string; name: string; category: string; images: string[]; description: string; warrantyPeriod?: number };
  vendorId: { _id: string; businessName: string };
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  buyerId: { _id: string; name: string; email: string };
  buyerRole: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveryAddress: { street: string; district: string; state: string; pincode: string };
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
  const [userReviews, setUserReviews] = useState<Record<string, { rating: number; comment?: string; photos?: Array<{ url: string; caption?: string }> }>>({});
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const orderPlaced = location.state?.orderPlaced;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const response = await fetch(`${backendUrl}/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        await fetchUserReviews(data.data._id);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${backendUrl}/api/reviews/order/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const map: Record<string, { rating: number; comment?: string; photos?: Array<{ url: string; caption?: string }> }> = {};
        data.data.forEach((r: any) => { map[r.productId] = { rating: r.rating, comment: r.comment, photos: r.photos || [] }; });
        setUserReviews(map);
      }
    } catch (err) { console.error('Error fetching user reviews', err); }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any; desc: string }> = {
      PLACED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, desc: 'Order placed and being processed' },
      CONFIRMED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, desc: 'Order confirmed by vendor' },
      PROCESSING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Package, desc: 'Order is being prepared' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck, desc: 'Order shipped and on the way' },
      DELIVERED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, desc: 'Order delivered successfully' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, desc: 'Order has been cancelled' }
    };
    return configs[status] || configs.PLACED;
  };

  const getPaymentConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: any }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      PAID: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: RotateCcw }
    };
    return configs[status] || configs.PENDING;
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, { icon: string; bg: string; text: string }> = {
      'Fertilizers': { icon: '🌱', bg: 'bg-emerald-100', text: 'text-emerald-700' },
      'Pesticides': { icon: '🛡️', bg: 'bg-blue-100', text: 'text-blue-700' },
      'Equipment & Tools': { icon: '🔧', bg: 'bg-amber-100', text: 'text-amber-700' }
    };
    return styles[category] || { icon: '📦', bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const canReview = (o: Order) => o.orderStatus === 'DELIVERED' && o.deliveredAt && (Date.now() - new Date(o.deliveredAt).getTime()) / 86400000 >= 7;
  const canReturn = (o: Order) => o.orderStatus === 'DELIVERED' && o.deliveredAt && (Date.now() - new Date(o.deliveredAt).getTime()) / 86400000 < 7;
  const getDaysUntilReturnExpiry = (o: Order) => o.deliveredAt ? Math.max(0, 7 - Math.floor((Date.now() - new Date(o.deliveredAt).getTime()) / 86400000)) : 0;
  const canDownloadInvoice = (o: Order) => o.orderStatus === 'DELIVERED' && o.deliveredAt && (Date.now() - new Date(o.deliveredAt).getTime()) / 86400000 >= 7;

  const handleDownloadInvoice = async () => {
    if (!order || downloadingInvoice) return;
    setDownloadingInvoice(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/orders/${order._id}/invoice`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) { const data = await response.json(); alert(data.message || 'Failed to download invoice'); return; }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch { alert('Error downloading invoice'); } finally { setDownloadingInvoice(false); }
  };

  const handleReturnRequest = async () => {
    if (!order || requestingReturn) return;
    setRequestingReturn(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendUrl}/api/orders/${order._id}/return-request`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason })
      });
      const data = await response.json();
      if (data.success) await fetchOrder();
      else alert(data.message || 'Failed to submit return request');
    } catch { alert('Error submitting return request'); } finally { setRequestingReturn(false); }
  };

  useEffect(() => { if (id) fetchOrder(); }, [id]);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      </MarketplaceLayout>
    );
  }

  if (!order) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h2>
            <p className="text-gray-500 mb-6">The order doesn't exist or you don't have access.</p>
            <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const statusConfig = getStatusConfig(order.orderStatus);
  const StatusIcon = statusConfig.icon;
  const paymentConfig = getPaymentConfig(order.paymentStatus);
  const PaymentIcon = paymentConfig.icon;

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/orders" className="flex items-center gap-2 text-emerald-100 hover:text-white transition">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Orders</span>
                </Link>
                <div className="w-px h-6 bg-emerald-400/50" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Order Details</h1>
                    <p className="text-emerald-100 text-sm">#{order.orderNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  <StatusIcon className="w-4 h-4" />
                  {order.orderStatus.charAt(0) + order.orderStatus.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {orderPlaced && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Order Placed Successfully!</h3>
                <p className="text-sm text-emerald-600">Your order #{order.orderNumber} has been placed and is being processed.</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Order Info Card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${paymentConfig.bg} ${paymentConfig.text}`}>
                    <PaymentIcon className="w-3 h-3" />
                    {order.orderStatus === 'DELIVERED' && order.paymentStatus === 'PENDING' ? 'Collected' : order.paymentStatus}
                  </span>
                </div>
                <div className="p-5">
                  <div className={`flex items-start gap-3 p-4 rounded-xl ${statusConfig.bg.replace('100', '50')} border ${statusConfig.bg.replace('bg-', 'border-').replace('100', '200')}`}>
                    <StatusIcon className={`w-5 h-5 ${statusConfig.text} mt-0.5`} />
                    <div>
                      <p className={`font-medium ${statusConfig.text}`}>Order Status</p>
                      <p className={`text-sm ${statusConfig.text.replace('700', '600')}`}>{statusConfig.desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Order Items ({order.items.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => {
                    const catStyle = getCategoryStyle(item.productId.category);
                    return (
                      <div key={index} className="p-5">
                        <div className="flex gap-4">
                          <Link to={`/marketplace/product/${item.productId._id}`} className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                            <img src={item.productId.images?.[0] ? `${backendUrl}${item.productId.images[0]}` : '/placeholder-product.jpg'}
                              alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                                  {catStyle.icon} {item.productId.category}
                                </span>
                                <Link to={`/marketplace/product/${item.productId._id}`}>
                                  <h3 className="font-semibold text-gray-800 mt-1 hover:text-emerald-600 transition">{item.productName}</h3>
                                </Link>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Building className="w-3 h-3" /> {item.vendorId.businessName}
                                </p>
                                {item.productId.warrantyPeriod && (
                                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                                    <Shield className="w-3 h-3" /> {item.productId.warrantyPeriod} months warranty
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">₹{item.subtotal.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">₹{item.price.toLocaleString()} × {item.quantity}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {canReview(order) && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <ReviewWithPhotos productId={item.productId._id} orderId={order._id} productName={item.productName}
                              onReviewSubmitted={() => fetchUserReviews(order._id)}
                              existingReview={userReviews[item.productId._id] ? { rating: userReviews[item.productId._id].rating, comment: userReviews[item.productId._id].comment, photos: userReviews[item.productId._id].photos } : undefined} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-semibold text-gray-800">Delivery Address</h2>
                </div>
                <div className="p-5">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-800">{order.deliveryAddress.street}</p>
                    <p className="text-gray-600">{order.deliveryAddress.district}, {order.deliveryAddress.state}</p>
                    <p className="text-gray-500">PIN: {order.deliveryAddress.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-gray-800">Order Notes</h2>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-600 bg-blue-50 rounded-xl p-4 border border-blue-100">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-5">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-6">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Order Summary</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Items ({order.items.length})</span>
                      <span className="text-gray-800 font-medium">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-emerald-600">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Invoice Button */}
                  {canDownloadInvoice(order) && (
                    <button onClick={handleDownloadInvoice} disabled={downloadingInvoice}
                      className="mt-5 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 transition flex items-center justify-center gap-2">
                      {downloadingInvoice ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Download className="w-4 h-4" /> Download Invoice</>}
                    </button>
                  )}
                  {order.orderStatus === 'DELIVERED' && !canDownloadInvoice(order) && (
                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Invoice Available Soon</p>
                          <p className="text-xs text-amber-600">{getDaysUntilReturnExpiry(order)} days until return period ends</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Customer</h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-800">{order.buyerId.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-600 text-sm truncate">{order.buyerId.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-600 capitalize">{order.buyerRole}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Payment</h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="text-gray-800 flex items-center gap-1"><CreditCard className="w-4 h-4" /> COD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentConfig.bg} ${paymentConfig.text}`}>
                      {order.orderStatus === 'DELIVERED' && order.paymentStatus === 'PENDING' ? 'Collected' : order.paymentStatus}
                    </span>
                  </div>
                </div>
                {order.paymentStatus === 'PENDING' && order.orderStatus !== 'DELIVERED' && (
                  <div className="px-5 pb-5">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                      Payment will be collected upon delivery
                    </div>
                  </div>
                )}
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Timeline</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Order Placed</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {order.updatedAt !== order.createdAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Last Updated</p>
                          <p className="text-xs text-gray-500">{new Date(order.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Delivered</p>
                          <p className="text-xs text-gray-500">{new Date(order.deliveredAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Returns Section */}
              {order.orderStatus === 'DELIVERED' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-gray-500" />
                    <h2 className="font-semibold text-gray-800">Returns</h2>
                  </div>
                  <div className="p-5">
                    {order.returnStatus === 'REQUESTED' ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-sm font-medium text-amber-800">Return Requested</p>
                        <p className="text-xs text-amber-600 mt-1">Requested on {order.returnRequestedAt ? new Date(order.returnRequestedAt).toLocaleDateString() : '—'}</p>
                      </div>
                    ) : order.returnStatus === 'APPROVED' ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-sm font-medium text-emerald-800">Return Approved</p>
                        <p className="text-xs text-emerald-600 mt-1">We will contact you with next steps</p>
                      </div>
                    ) : order.returnStatus === 'REJECTED' ? (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-sm font-medium text-red-800">Return Rejected</p>
                        {order.returnReason && <p className="text-xs text-red-600 mt-1">Reason: {order.returnReason}</p>}
                      </div>
                    ) : canReturn(order) ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-sm font-medium text-blue-800">Return Window Open</p>
                          <p className="text-xs text-blue-600">{getDaysUntilReturnExpiry(order)} days remaining</p>
                        </div>
                        <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} rows={2}
                          placeholder="Reason for return..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none" />
                        <button onClick={handleReturnRequest} disabled={requestingReturn}
                          className="w-full py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 disabled:bg-gray-400 transition flex items-center justify-center gap-2">
                          {requestingReturn ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><RotateCcw className="w-4 h-4" /> Request Return</>}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-gray-500" />
                          <p className="text-sm font-medium text-gray-700">Return Window Closed</p>
                        </div>
                        <p className="text-xs text-gray-500">The 7-day return window has expired</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Continue Shopping */}
              <Link to="/marketplace" className="flex items-center justify-center gap-2 py-3 text-emerald-600 hover:text-emerald-700 font-medium transition">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Support Chat */}
      {order && order.items[0] && (
        <SupportChat 
          orderId={order._id}
          productId={order.items[0].productId._id}
          vendorId={order.items[0].vendorId._id}
        />
      )}
    </MarketplaceLayout>
  );
};

export default OrderDetails;