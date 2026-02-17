import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InvestorLayout } from "./InvestorLayout";
import { Link } from "react-router-dom";
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
  TrendingUp,
  RefreshCw,
  Loader2,
  Building2,
  Smartphone,
  Star,
  ArrowDownToLine,
  Banknote,
  Eye,
  Leaf,
  Receipt,
  ExternalLink,
  IndianRupee,
  History
} from "lucide-react";

interface Investment {
  _id: string;
  amount: number;
  expectedProfit?: number;
  status: string;
  project: {
    title: string;
    status: string;
    cropType?: string;
  } | null;
}

interface PayoutMethod {
  _id: string;
  type: "bank" | "upi";
  name?: string;
  upiId?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isDefault?: boolean;
}

interface ReturnRequest {
  _id: string;
  investmentId: string;
  investment: Investment | null;
  payoutMethodId: PayoutMethod | null;
  status: "pending" | "approved" | "rejected" | "completed" | "paid";
  adminComment?: string;
  paymentReceipt?: string;
  paymentDate?: string;
  transactionId?: string;
  amountPaid?: number;
  createdAt: string;
  reviewedAt?: string;
}

const ReturnRequestHistory: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/investor/return-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(res.data.returnRequests || []);
      setFilteredRequests(res.data.returnRequests || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to fetch return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((req) => req.status === filterStatus));
    }
  }, [filterStatus, requests]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", label: status === "paid" ? "Paid" : "Completed" };
      case "approved":
        return { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200", label: "Approved" };
      case "pending":
        return { icon: Clock, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", label: "Pending" };
      case "rejected":
        return { icon: XCircle, color: "text-red-600", bg: "bg-red-100", border: "border-red-200", label: "Rejected" };
      default:
        return { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", label: status };
    }
  };

  const exportToCSV = () => {
    const headers = ["Project", "Investment Amount", "Expected Return (5%)", "Total Payout", "Status", "Payout Method", "Amount Paid", "Transaction ID", "Request Date", "Payment Date"];
    const csvData = filteredRequests.map((req) => {
      const investment = req.investment?.amount || 0;
      const expectedReturn = investment * 0.05;
      const totalPayout = investment * 1.05;
      return [
        req.investment?.project?.title || "N/A",
        investment ? `₹${investment}` : "N/A",
        expectedReturn ? `₹${expectedReturn}` : "N/A",
        totalPayout ? `₹${totalPayout}` : "N/A",
        req.status,
        req.payoutMethodId?.type === "bank" ? `Bank - ${req.payoutMethodId.bankName || ""}` : `UPI - ${req.payoutMethodId?.upiId || ""}`,
        req.amountPaid ? `₹${req.amountPaid}` : "",
        req.transactionId || "",
        new Date(req.createdAt).toLocaleDateString(),
        req.paymentDate ? new Date(req.paymentDate).toLocaleDateString() : "",
      ];
    });

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "return-request-history.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    paid: requests.filter((r) => r.status === "paid" || r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <InvestorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <ToastContainer position="top-right" autoClose={4000} theme="light" />

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <History className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Return Request History</h1>
                <p className="text-purple-100 mt-1">Track all your investment return requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={fetchRequests}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, icon: FileText, color: "bg-blue-100 text-blue-600" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "bg-amber-100 text-amber-600" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "bg-sky-100 text-sky-600" },
            { label: "Paid", value: stats.paid, icon: IndianRupee, color: "bg-emerald-100 text-emerald-600" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-100 text-red-600" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:flex-none md:w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="text-sm text-gray-500">
            Showing {filteredRequests.length} of {requests.length} requests
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Return Requests Found</h3>
            <p className="text-gray-500 mb-6">
              {filterStatus === "all"
                ? "You haven't submitted any return requests yet."
                : `No ${filterStatus} requests found.`}
            </p>
            <Link
              to="/investor/return-request"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
            >
              <ArrowDownToLine className="w-5 h-5" />
              Request a Return
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const statusConfig = getStatusConfig(req.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedId === req._id;

              return (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
                >
                  {/* Main Row */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : req._id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Project Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {req.investment?.project?.title || "Unknown Project"}
                            </h3>
                            {req.investment?.project?.cropType && (
                              <p className="text-sm text-gray-500">{req.investment.project.cropType}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Investment Amount */}
                      {req.investment?.amount && (
                        <div className="text-center md:text-left">
                          <p className="text-xs text-gray-500 uppercase">Investment</p>
                          <p className="font-bold text-gray-800">
                            ₹{req.investment.amount.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Expected Return (5% of investment) */}
                      {req.investment?.amount && (
                        <div className="text-center md:text-left">
                          <p className="text-xs text-gray-500 uppercase">Expected Return</p>
                          <p className="font-bold text-emerald-600">
                            +₹{(req.investment.amount * 0.05).toLocaleString()}
                            <span className="text-xs text-gray-400 ml-1">(5%)</span>
                          </p>
                        </div>
                      )}

                      {/* Total Payout */}
                      {req.investment?.amount && (
                        <div className="text-center md:text-left">
                          <p className="text-xs text-gray-500 uppercase">Total Payout</p>
                          <p className="font-bold text-purple-600">
                            ₹{(req.investment.amount * 1.05).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Amount Paid - only show if paid */}
                      {req.amountPaid && (
                        <div className="text-center md:text-left">
                          <p className="text-xs text-gray-500 uppercase">Amount Paid</p>
                          <p className="font-bold text-green-600">
                            ₹{req.amountPaid.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="text-center md:text-right">
                        <p className="text-xs text-gray-500 uppercase">Requested</p>
                        <p className="text-sm text-gray-700">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Payout Method */}
                        {req.payoutMethodId && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              {req.payoutMethodId.type === "bank" ? (
                                <Building2 className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Smartphone className="w-4 h-4 text-emerald-600" />
                              )}
                              Payout Method
                            </h4>
                            <div className="space-y-1 text-sm">
                              {req.payoutMethodId.type === "bank" ? (
                                <>
                                  {req.payoutMethodId.bankName && (
                                    <p className="font-medium text-gray-800">{req.payoutMethodId.bankName}</p>
                                  )}
                                  {req.payoutMethodId.accountNumber && (
                                    <p className="text-gray-600">A/C: ••••{req.payoutMethodId.accountNumber.slice(-4)}</p>
                                  )}
                                  {req.payoutMethodId.ifscCode && (
                                    <p className="text-gray-600">IFSC: {req.payoutMethodId.ifscCode}</p>
                                  )}
                                  {req.payoutMethodId.accountHolderName && (
                                    <p className="text-gray-500">{req.payoutMethodId.accountHolderName}</p>
                                  )}
                                </>
                              ) : (
                                <>
                                  {req.payoutMethodId.name && (
                                    <p className="font-medium text-gray-800">{req.payoutMethodId.name}</p>
                                  )}
                                  {req.payoutMethodId.upiId && (
                                    <p className="text-gray-600">{req.payoutMethodId.upiId}</p>
                                  )}
                                </>
                              )}
                              {req.payoutMethodId.isDefault && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                  <Star className="w-3 h-3 fill-current" /> Default
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment Info - only show if there's payment data */}
                        {(req.transactionId || req.paymentDate || req.amountPaid || req.paymentReceipt) && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-purple-600" />
                              Payment Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              {req.transactionId && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">Transaction ID</span>
                                  <span className="font-mono text-gray-800">{req.transactionId}</span>
                                </div>
                              )}
                              {req.paymentDate && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">Payment Date</span>
                                  <span className="text-gray-800">{new Date(req.paymentDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {req.amountPaid && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500">Amount Paid</span>
                                  <span className="font-bold text-emerald-600">₹{req.amountPaid.toLocaleString()}</span>
                                </div>
                              )}
                              {req.paymentReceipt && (
                                <a
                                  href={`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}${req.paymentReceipt}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mt-2"
                                >
                                  <Receipt className="w-4 h-4" />
                                  View Receipt
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Admin Comment - only show if there's a comment */}
                        {req.adminComment && (
                          <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-indigo-600" />
                              Admin Response
                            </h4>
                            <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-800">
                              "{req.adminComment}"
                            </div>
                            {req.reviewedAt && (
                              <p className="text-xs text-gray-500 mt-3">
                                Reviewed on {new Date(req.reviewedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Investment Summary Card */}
                        {req.investment?.amount && (
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                            <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                              Return Summary
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-emerald-700">Principal</span>
                                <span className="font-medium text-gray-800">₹{req.investment.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-emerald-700">Return (5%)</span>
                                <span className="font-medium text-emerald-600">+₹{(req.investment.amount * 0.05).toLocaleString()}</span>
                              </div>
                              <div className="border-t border-emerald-200 pt-2 flex items-center justify-between">
                                <span className="font-semibold text-emerald-800">Total</span>
                                <span className="font-bold text-emerald-700">₹{(req.investment.amount * 1.05).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Action */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowDownToLine className="w-5 h-5 text-purple-600" />
            <span className="text-purple-800">Need to request another return?</span>
          </div>
          <Link
            to="/investor/return-request"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
          >
            New Request
          </Link>
        </div>
      </div>
    </InvestorLayout>
  );
};

export default ReturnRequestHistory;
