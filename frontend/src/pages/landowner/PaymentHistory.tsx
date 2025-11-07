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
  Eye
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
  lease: Lease;
  farmer: Farmer;
  amount: number;
  status: string;
  requestedAt: string;
  payoutMethod: PayoutMethod;
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
        "http://localhost:5000/api/payment-requests/my-requests",
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
        `http://localhost:5000/api/payment-requests/cancel-request/${requestId}`,
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
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "canceled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
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
      req.lease._id.slice(-8),
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
      <div 
        className="min-h-screen p-6 relative"
        style={{
          background: 'linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Glowing Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 59, 59, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header Section */}
          <div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 
                  className="text-3xl font-bold text-white uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Payment History
                </h1>
                <p className="text-gray-300 text-lg">
                  Track and manage all your payment requests in one place
                </p>
              </div>
              
              <button
                onClick={exportToCSV}
                className="mt-4 lg:mt-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ff3b3b 0%, #ff5e5e 100%)',
                }}
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filter and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Filter Card */}
            <div 
              className="lg:col-span-1 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-red-400" />
                <h3 
                  className="text-lg font-bold text-white uppercase tracking-wide"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Filters
                </h3>
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all" className="bg-gray-800">All Requests</option>
                <option value="pending" className="bg-gray-800">Pending</option>
                <option value="completed" className="bg-gray-800">Completed</option>
                <option value="canceled" className="bg-gray-800">Canceled</option>
              </select>
            </div>

            {/* Stats Cards */}
            <div 
              className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { status: "all", label: "Total Requests", count: requests.length, color: "from-blue-500 to-blue-600" },
                { status: "pending", label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "from-yellow-500 to-yellow-600" },
                { status: "completed", label: "Completed", count: requests.filter(r => r.status === "completed").length, color: "from-green-500 to-green-600" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.count}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      {getStatusIcon(stat.status === "all" ? "pending" : stat.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Requests Table */}
          <div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No payment requests found</h3>
                <p className="text-gray-400">No payment requests match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wide text-sm">Lease Details</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wide text-sm">Amount</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wide text-sm">Status</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wide text-sm">Requested</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wide text-sm">Payout Method</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-semibold uppercase tracking-wide text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr 
                        key={req._id} 
                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-white">Lease #{req.lease._id.slice(-8)}</p>
                            <p className="text-gray-400 text-sm">Farmer: {req.farmer.name || req.farmer.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xl font-bold text-white">₹{req.amount}</span>
                          <p className="text-gray-400 text-sm">Monthly</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                            {getStatusIcon(req.status)}
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white">{new Date(req.requestedAt).toLocaleDateString()}</p>
                          <p className="text-gray-400 text-sm">{new Date(req.requestedAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{req.payoutMethod.type.toUpperCase()}</p>
                            <p className="text-gray-400 text-sm">
                              {req.payoutMethod.name || req.payoutMethod.upiId || req.payoutMethod.accountNumber}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {req.status === "pending" && (
                              <button
                                onClick={() => cancelRequest(req._id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                style={{
                                  background: 'linear-gradient(135deg, #ff3b3b 0%, #ff5e5e 100%)',
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Cancel
                              </button>
                            )}
                            <button 
                              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 group-hover:scale-110"
                              onClick={() => setActiveDropdown(activeDropdown === req._id ? null : req._id)}
                            >
                              <MoreVertical className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden mt-6 space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold">Lease #{req.lease._id.slice(-8)}</p>
                    <p className="text-gray-400 text-sm">{req.farmer.name || req.farmer.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                    {getStatusIcon(req.status)}
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-white font-semibold">₹{req.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Requested</p>
                    <p className="text-white font-semibold">{new Date(req.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">Payout Method</p>
                  <p className="text-white font-medium">{req.payoutMethod.type.toUpperCase()}</p>
                  <p className="text-gray-400 text-sm">
                    {req.payoutMethod.name || req.payoutMethod.upiId || req.payoutMethod.accountNumber}
                  </p>
                </div>
                
                {req.status === "pending" && (
                  <button
                    onClick={() => cancelRequest(req._id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #ff3b3b 0%, #ff5e5e 100%)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel Request
                  </button>
                )}
              </div>
            ))}
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