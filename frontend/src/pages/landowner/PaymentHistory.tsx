// PaymentHistory.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Layout } from "./LandownerDashboard";
import { 
  Filter, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreVertical,
  Trash2,
  FileText,
  CreditCard,
  Calendar,
  MessageSquare
} from "lucide-react";

interface PayoutMethod {
  type: string;
  name?: string;
  upiId?: string;
  accountNumber?: string;
  bankName?: string;
  isDefault?: boolean;
}

interface Farmer {
  name: string | null;
  email: string;
  phone: string;
}

interface Lease {
  _id: string;
  pricePerMonth: number;
  paymentsMade: number;
  totalPayments: number;
  status: string;
}

interface PaymentRequest {
  _id: string;
  lease: Lease | null;
  farmer: Farmer | null;
  amount: number;
  status: string;
  requestedAt: string;
  payoutMethod: PayoutMethod;
  paymentReceipt?: string;
  transactionId?: string;
  paymentDate?: string;
  adminNote?: string;
  reviewedAt?: string;
}

const PaymentHistory: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await axios.get(
        "https://agricorus.duckdns.org/api/payment-requests/my-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(data.requests);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payment requests:", err);
      setLoading(false);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to cancel this payment request?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.patch(
        `https://agricorus.duckdns.org/api/payment-requests/cancel-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "canceled" } : req
        )
      );
    } catch (err) {
      console.error("Error canceling request:", err);
      alert("Failed to cancel the request.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "canceled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "approved":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "canceled":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredRequests = requests.filter(
    (req) => filter === "all" || req.status === filter
  );

  const exportToCSV = () => {
    const headers = ["Lease ID", "Amount", "Status", "Requested At", "Payout Method"];
    const csvData = filteredRequests.map(req => [
      req.lease?._id?.slice(-8) || 'N/A',
      `₹${req.amount}`,
      req.status,
      new Date(req.requestedAt).toLocaleDateString(),
      `${req.payoutMethod.type.toUpperCase()} - ${req.payoutMethod.name || req.payoutMethod.upiId || req.payoutMethod.accountNumber}`
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Payment History
                </h1>
                <p className="text-gray-600 text-sm sm:text-lg">
                  Track and manage all your payment requests in one place
                </p>
              </div>
              
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filter and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
            {/* Filter Card */}
            <div className="lg:col-span-1 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Filters
                </h3>
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { status: "all", label: "Total Requests", count: requests.length, color: "bg-blue-100" },
                { status: "pending", label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "bg-yellow-100" },
                { status: "paid", label: "Paid", count: requests.filter(r => r.status === "paid").length, color: "bg-green-100" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs sm:text-sm uppercase tracking-wide mb-1">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
                      {getStatusIcon(stat.status === "all" ? "pending" : stat.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Requests Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16 px-4">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No payment requests found</h3>
                <p className="text-sm sm:text-base text-gray-600">No payment requests match your current filters.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Lease Details</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Amount</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Status</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Requested</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Payout Method</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Payment Info</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr 
                        key={req._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-gray-900">Lease #{req.lease?._id?.slice(-8) || 'N/A'}</p>
                            <p className="text-gray-600 text-sm">Farmer: {req.farmer?.name || req.farmer?.email || 'Unknown'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xl font-bold text-gray-900">₹{req.amount}</span>
                          <p className="text-gray-600 text-sm">Monthly</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                            {getStatusIcon(req.status)}
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-900">{new Date(req.requestedAt).toLocaleDateString()}</p>
                          <p className="text-gray-600 text-sm">{new Date(req.requestedAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-gray-900 font-medium">{req.payoutMethod.type.toUpperCase()}</p>
                            <p className="text-gray-600 text-sm">
                              {req.payoutMethod.name || req.payoutMethod.upiId || req.payoutMethod.accountNumber}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            {req.transactionId && (
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-4 h-4 text-emerald-600" />
                                <span className="text-gray-900 font-medium">{req.transactionId}</span>
                              </div>
                            )}
                            {req.paymentDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-900">{new Date(req.paymentDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {req.paymentReceipt && (
                              <a
                                href={`https://agricorus.duckdns.org${req.paymentReceipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                <FileText className="w-4 h-4" />
                                View Receipt
                              </a>
                            )}
                            {req.adminNote && (
                              <div className="flex items-start gap-2 text-sm">
                                <MessageSquare className="w-4 h-4 text-purple-600 mt-0.5" />
                                <span className="text-gray-700 italic">{req.adminNote}</span>
                              </div>
                            )}
                            {!req.transactionId && !req.paymentDate && !req.paymentReceipt && !req.adminNote && (
                              <span className="text-sm text-gray-400">No payment info yet</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {req.status === "pending" && (
                              <button
                                onClick={() => cancelRequest(req._id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                            <button 
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                              onClick={() => setActiveDropdown(activeDropdown === req._id ? null : req._id)}
                            >
                              <MoreVertical className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden p-3 sm:p-4 space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">Lease #{req.lease?._id?.slice(-8) || 'N/A'}</p>
                    <p className="text-xs text-gray-600 truncate">{req.farmer?.name || req.farmer?.email || 'Unknown'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)} ml-2 flex-shrink-0`}>
                    {getStatusIcon(req.status)}
                    <span className="hidden sm:inline">{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-gray-900">₹{req.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(req.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Payout Method</p>
                  <p className="text-sm font-medium text-gray-900">{req.payoutMethod.type.toUpperCase()}</p>
                  <p className="text-xs text-gray-600 truncate">
                    {req.payoutMethod.name || req.payoutMethod.upiId || req.payoutMethod.accountNumber}
                  </p>
                </div>

                {/* Payment Info */}
                {(req.transactionId || req.paymentDate || req.paymentReceipt || req.adminNote) && (
                  <div className="mb-3 space-y-2">
                    <p className="text-xs text-gray-500 font-semibold">Payment Information</p>
                    {req.transactionId && (
                      <div className="flex items-center gap-2 text-xs">
                        <CreditCard className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-900 font-medium truncate">{req.transactionId}</span>
                      </div>
                    )}
                    {req.paymentDate && (
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-900">{new Date(req.paymentDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {req.paymentReceipt && (
                      <a
                        href={`https://agricorus.duckdns.org${req.paymentReceipt}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        View Receipt
                      </a>
                    )}
                    {req.adminNote && (
                      <div className="flex items-start gap-2 text-xs">
                        <MessageSquare className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 italic line-clamp-2">{req.adminNote}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {req.status === "pending" && (
                  <button
                    onClick={() => cancelRequest(req._id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-white bg-red-600 hover:bg-red-700 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel Request
                  </button>
                )}
              </div>
            ))}
          </div>
              </>
            )}
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
          
          select option {
            background: #1f2937;
            color: white;
            padding: 12px;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default PaymentHistory;