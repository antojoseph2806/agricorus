import { useState, useEffect } from "react";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import {
  CreditCard,
  IndianRupee,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Eye,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  BarChart3
} from "lucide-react";

interface Payment {
  _id: string;
  orderNumber: string;
  orderId: {
    _id: string;
    orderNumber: string;
    orderStatus: string;
    deliveryAddress: any;
    items: any[];
  };
  buyerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  paymentMethod: string;
  vendorAmount: number;
  platformFee: number;
  totalAmount: number;
  paymentStatus: string;
  refundAmount: number;
  refundStatus: string;
  settlementStatus: string;
  paidAt: string;
  refundedAt?: string;
  settledAt?: string;
  createdAt: string;
  netAmount: number;
}

interface PaymentSummary {
  totalEarnings: number;
  totalRefunds: number;
  netEarnings: number;
  pendingAmount: number;
  settledAmount: number;
}

const VendorPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: 'ALL',
    paymentMethod: 'ALL',
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams();
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.paymentMethod !== 'ALL') params.append('paymentMethod', filters.paymentMethod);
      if (filters.search) params.append('search', filters.search);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/payments?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPayments(response.data.data.payments);
        setSummary(response.data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) {
      alert('Please fill in all refund details');
      return;
    }

    const amount = parseFloat(refundAmount);
    if (amount <= 0 || amount > (selectedPayment.vendorAmount - selectedPayment.refundAmount)) {
      alert('Invalid refund amount');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/payments/${selectedPayment._id}/refund`,
        {
          refundAmount: amount,
          refundReason: refundReason.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Refund processed successfully!');
        setShowRefundModal(false);
        setRefundAmount('');
        setRefundReason('');
        setSelectedPayment(null);
        fetchPayments();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return <RotateCcw className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
      case 'PARTIALLY_REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-green-600" />
            Payment Management
          </h1>
          <p className="text-gray-600">Track your earnings, manage refunds, and view payment analytics</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalEarnings)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.netEarnings)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(summary.pendingAmount)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Settled Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.settledAmount)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalRefunds)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">All Methods</option>
                <option value="razorpay">Online Payment</option>
                <option value="COD">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Order number, payment ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <button
                onClick={fetchPayments}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.buyerId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.buyerId.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                        </div>
                        {payment.paidAt && (
                          <div className="text-sm text-gray-500">
                            Paid: {new Date(payment.paidAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.vendorAmount)}
                        </div>
                        {payment.refundAmount > 0 && (
                          <div className="text-sm text-red-600">
                            Refunded: {formatCurrency(payment.refundAmount)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Net: {formatCurrency(payment.netAmount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.paymentStatus)}`}>
                        {getPaymentStatusIcon(payment.paymentStatus)}
                        <span>{payment.paymentStatus.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-green-600 hover:text-green-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.paymentStatus === 'PAID' && payment.refundAmount < payment.vendorAmount && (
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRefundModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Process Refund"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">Payments will appear here when customers place orders.</p>
            </div>
          )}
        </div>

        {/* Payment Details Modal */}
        {selectedPayment && !showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Payment Details</h3>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Number</label>
                    <p className="text-sm text-gray-900">{selectedPayment.orderNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <p className="text-sm text-gray-900">
                      {selectedPayment.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <p className="text-sm text-gray-900">{selectedPayment.buyerId.name}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.buyerId.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedPayment.paymentStatus)}`}>
                      {getPaymentStatusIcon(selectedPayment.paymentStatus)}
                      <span>{selectedPayment.paymentStatus.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedPayment.totalAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform Fee</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedPayment.platformFee)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Your Earnings</label>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedPayment.vendorAmount)}</p>
                  </div>
                </div>

                {selectedPayment.refundAmount > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Refund Amount</label>
                      <p className="text-sm text-red-600">{formatCurrency(selectedPayment.refundAmount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Net Amount</label>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedPayment.netAmount)}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedPayment.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {selectedPayment.paidAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Paid Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedPayment.paidAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Process Refund</h3>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundAmount('');
                    setRefundReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order: {selectedPayment.orderNumber}
                  </label>
                  <p className="text-sm text-gray-500">
                    Maximum refund: {formatCurrency(selectedPayment.vendorAmount - selectedPayment.refundAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedPayment.vendorAmount - selectedPayment.refundAmount}
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter refund amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Reason
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Explain the reason for refund..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleRefund}
                    disabled={processing || !refundAmount || !refundReason}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? "Processing..." : "Process Refund"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRefundModal(false);
                      setRefundAmount('');
                      setRefundReason('');
                    }}
                    disabled={processing}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorPayments;