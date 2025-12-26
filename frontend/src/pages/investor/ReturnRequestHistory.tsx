// src/pages/investor/ReturnRequestHistory.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { InvestorLayout } from "./InvestorLayout";
import {
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  CreditCard,
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingUp,
  RefreshCw
} from "lucide-react";

interface PayoutMethod {
  _id: string;
  methodName?: string;
  accountNumber?: string;
  details?: string;
}

interface ReturnRequest {
  _id: string;
  investmentId: string;
  payoutMethodId: PayoutMethod | null;
  status: string;
  createdAt: string;
  adminComment?: string;
  paymentReceipt?: string;
  transactionId?: string;
  paymentDate?: string;
  amountPaid?: number;
  reviewedAt?: string;
}

const ReturnRequestHistory: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/investor/return-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(res.data.returnRequests as ReturnRequest[]);
      setFilteredRequests(res.data.returnRequests as ReturnRequest[]);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to fetch return request history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => req.status === filterStatus));
    }
  }, [filterStatus, requests]);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "approved":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Investment ID", "Amount Paid", "Status", "Created At", "Transaction ID", "Payment Date"];
    const csvData = filteredRequests.map(req => [
      req.investmentId.slice(-12),
      req.amountPaid ? `₹${req.amountPaid}` : "N/A",
      req.status,
      new Date(req.createdAt).toLocaleDateString(),
      req.transactionId || "N/A",
      req.paymentDate ? new Date(req.paymentDate).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "return-request-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </InvestorLayout>
    );
  }

  return (
    <InvestorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Return Request History
                </h1>
                <p className="text-gray-600 text-lg">
                  Track and view all your return payment requests
                </p>
              </div>
              
              <div className="mt-4 lg:mt-0 flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={fetchRequests}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Filter and Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Filter Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Filters
                </h3>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Stats Cards */}
            {[
              { status: "all", label: "Total Requests", count: requests.length, color: "bg-blue-100", icon: FileText },
              { status: "pending", label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "bg-yellow-100", icon: Clock },
              { status: "paid", label: "Paid", count: requests.filter(r => r.status === "paid").length, color: "bg-green-100", icon: CheckCircle },
              { status: "completed", label: "Completed", count: requests.filter(r => r.status === "completed").length, color: "bg-emerald-100", icon: TrendingUp },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Return Requests Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No return requests found</h3>
                <p className="text-gray-600">
                  {filterStatus === "all" 
                    ? "You haven't submitted any return requests yet." 
                    : "No requests match your current filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Investment ID</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Amount</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Status</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Created</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Payout Method</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Payment Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr 
                        key={req._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300"
                      >
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-gray-900">{req.investmentId.slice(-12)}</span>
                        </td>
                        <td className="py-4 px-6">
                          {req.amountPaid ? (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-emerald-600" />
                              <span className="text-xl font-bold text-gray-900">₹{req.amountPaid.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not set</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                            {getStatusIcon(req.status)}
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-900">{new Date(req.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-600 text-sm">{new Date(req.createdAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            {req.payoutMethodId ? (
                              <>
                                <p className="text-gray-900 font-medium">{req.payoutMethodId.methodName || "Unknown"}</p>
                                <p className="text-gray-600 text-sm">
                                  {req.payoutMethodId.accountNumber || req.payoutMethodId.details || "N/A"}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-400">No payout method</p>
                            )}
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
                                href={`http://localhost:5000${req.paymentReceipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                <FileText className="w-4 h-4" />
                                View Receipt
                              </a>
                            )}
                            {req.adminComment && (
                              <div className="flex items-start gap-2 text-sm">
                                <MessageSquare className="w-4 h-4 text-purple-600 mt-0.5" />
                                <span className="text-gray-700 italic">{req.adminComment}</span>
                              </div>
                            )}
                            {!req.transactionId && !req.paymentDate && !req.paymentReceipt && !req.adminComment && (
                              <span className="text-sm text-gray-400">No payment info yet</span>
                            )}
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
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-sm text-gray-900">{req.investmentId.slice(-12)}</span>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(req.status)}`}>
                    {getStatusIcon(req.status)}
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-sm">Amount</p>
                    {req.amountPaid ? (
                      <p className="text-gray-900 font-semibold">₹{req.amountPaid.toLocaleString()}</p>
                    ) : (
                      <p className="text-gray-400 text-sm">Not set</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Created</p>
                    <p className="text-gray-900 font-semibold">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {req.payoutMethodId && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm">Payout Method</p>
                    <p className="text-gray-900 font-medium">{req.payoutMethodId.methodName || "Unknown"}</p>
                    <p className="text-gray-600 text-sm">
                      {req.payoutMethodId.accountNumber || req.payoutMethodId.details || "N/A"}
                    </p>
                  </div>
                )}

                {/* Payment Info */}
                {(req.transactionId || req.paymentDate || req.paymentReceipt || req.adminComment) && (
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <p className="text-gray-500 text-sm font-semibold">Payment Information</p>
                    {req.transactionId && (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span className="text-gray-900">{req.transactionId}</span>
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
                        href={`http://localhost:5000${req.paymentReceipt}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        <FileText className="w-4 h-4" />
                        View Receipt
                      </a>
                    )}
                    {req.adminComment && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span className="text-gray-700 italic">{req.adminComment}</span>
                      </div>
                    )}
                  </div>
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
    </InvestorLayout>
  );
};

export default ReturnRequestHistory;
