// src/pages/admin/ReturnRequests.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Layout } from "./Layout";
import {
  RefreshCw,
  Filter,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  CreditCard,
  User,
  DollarSign,
  Eye,
  X,
  TrendingUp,
  MessageSquare
} from "lucide-react";

// Types
interface PayoutMethod {
  _id: string;
  methodName?: string;
  accountNumber?: string;
  details?: string;
  type?: string;
  upiId?: string;
  bankName?: string;
}

interface Investor {
  _id: string;
  name: string;
  email: string;
}

interface ReturnRequest {
  _id: string;
  investor: Investor;
  investmentId: string;
  payoutMethodId: PayoutMethod | null;
  status: "pending" | "approved" | "rejected" | "completed" | "paid";
  createdAt: string;
  adminComment?: string;
  paymentReceipt?: string;
  transactionId?: string;
  paymentDate?: string;
  amountPaid?: number;
  reviewedAt?: string;
}

// Component
const ReturnRequestsAdmin: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // Modal form state
  const [modalStatus, setModalStatus] = useState<string>("");
  const [adminComment, setAdminComment] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://agricorus.onrender.com/api/investor/return-requests/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(data.returnRequests || []);
      setFilteredRequests(data.returnRequests || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch return requests");
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

  // Open modal
  const openModal = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setModalStatus(request.status);
    setAdminComment(request.adminComment || "");
    setTransactionId(request.transactionId || "");
    setPaymentDate(request.paymentDate ? new Date(request.paymentDate).toISOString().split('T')[0] : "");
    setAmountPaid(request.amountPaid?.toString() || "");
    setReceiptFile(null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setModalStatus("");
    setAdminComment("");
    setTransactionId("");
    setPaymentDate("");
    setAmountPaid("");
    setReceiptFile(null);
  };

  // Upload receipt
  const uploadReceipt = async (requestId: string) => {
    if (!receiptFile) {
      toast.error("Please select a receipt file");
      return;
    }

    try {
      setUploadingReceipt(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("receipt", receiptFile);

      const { data } = await axios.post(
        `https://agricorus.onrender.com/api/investor/return-requests/admin/${requestId}/upload-receipt`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Receipt uploaded successfully");
      
      // Update the request in state
      setRequests(prev =>
        prev.map(r => r._id === requestId ? { ...r, paymentReceipt: data.receiptUrl } : r)
      );
      
      if (selectedRequest && selectedRequest._id === requestId) {
        setSelectedRequest({ ...selectedRequest, paymentReceipt: data.receiptUrl });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to upload receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Update return request
  const updateReturnRequest = async () => {
    if (!selectedRequest) return;

    try {
      setUpdatingId(selectedRequest._id);
      const token = localStorage.getItem("token");

      // Upload receipt first if selected
      if (receiptFile) {
        await uploadReceipt(selectedRequest._id);
      }

      // Update status and details
      const { data } = await axios.patch(
        `https://agricorus.onrender.com/api/investor/return-requests/admin/${selectedRequest._id}`,
        {
          status: modalStatus,
          adminComment,
          transactionId,
          paymentDate: paymentDate || undefined,
          amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data.message);
      
      // Update the request in state
      setRequests(prev =>
        prev.map(r => r._id === selectedRequest._id ? { 
          ...r, 
          status: modalStatus as any,
          adminComment,
          transactionId,
          paymentDate,
          amountPaid: amountPaid ? parseFloat(amountPaid) : undefined,
          reviewedAt: new Date().toISOString()
        } : r)
      );

      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update request");
    } finally {
      setUpdatingId(null);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Pending" },
      approved: { icon: CheckCircle, color: "bg-blue-100 text-blue-800 border-blue-300", label: "Approved" },
      paid: { icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-300", label: "Paid" },
      completed: { icon: CheckCircle, color: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Completed" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-300", label: "Rejected" },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Request ID", "Investor", "Investment ID", "Amount Paid", "Status", "Created At", "Transaction ID", "Payment Date"];
    const csvData = filteredRequests.map(req => [
      req._id.slice(-8),
      req.investor.name,
      req.investmentId.slice(-8),
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
    a.download = `return-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Investor Return Requests
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage and process investor return payment requests
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button
                onClick={fetchRequests}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats and Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Filter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Filter</h3>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
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
            { label: "Total", count: requests.length, color: "bg-blue-100", icon: FileText },
            { label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "bg-yellow-100", icon: Clock },
            { label: "Approved", count: requests.filter(r => r.status === "approved").length, color: "bg-blue-100", icon: CheckCircle },
            { label: "Paid", count: requests.filter(r => r.status === "paid").length, color: "bg-green-100", icon: CheckCircle },
            { label: "Completed", count: requests.filter(r => r.status === "completed").length, color: "bg-emerald-100", icon: TrendingUp },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-500 text-xs sm:text-sm uppercase tracking-wide mb-1 truncate">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl ${stat.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No return requests found</h3>
              <p className="text-sm sm:text-base text-gray-600">No requests match your current filters.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <div key={req._id} className="p-4 hover:bg-gray-50 transition-all duration-300">
                    <div className="space-y-3">
                      {/* Investor Info */}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          {req.investor.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{req.investor.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Created: {new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>

                      {/* Investment ID & Amount */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Investment ID</p>
                          <span className="font-mono text-xs text-gray-900">{req.investmentId.slice(-12)}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount</p>
                          {req.amountPaid ? (
                            <span className="text-base font-bold text-gray-900">₹{req.amountPaid.toLocaleString()}</span>
                          ) : (
                            <span className="text-xs text-gray-400">Not set</span>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        {getStatusBadge(req.status)}
                      </div>

                      {/* Payout Method */}
                      {req.payoutMethodId && (
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500 mb-1">Payout Method</p>
                          <p className="font-medium text-gray-900 text-sm">
                            {req.payoutMethodId.methodName || req.payoutMethodId.type?.toUpperCase() || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {req.payoutMethodId.accountNumber || req.payoutMethodId.upiId || req.payoutMethodId.details || "N/A"}
                          </p>
                        </div>
                      )}

                      {/* Payment Info */}
                      {(req.transactionId || req.paymentDate || req.paymentReceipt) && (
                        <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                          <p className="text-xs text-gray-500 mb-1">Payment Info</p>
                          {req.transactionId && (
                            <p className="text-xs text-gray-900 flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-gray-500" />
                              {req.transactionId}
                            </p>
                          )}
                          {req.paymentDate && (
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              {new Date(req.paymentDate).toLocaleDateString()}
                            </p>
                          )}
                          {req.paymentReceipt && (
                            <a
                              href={`https://agricorus.onrender.com${req.paymentReceipt}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              View Receipt
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => openModal(req)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Investor Details</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Investment ID</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Amount</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Status</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Payout Method</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Payment Info</th>
                      <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300">
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            {req.investor.name}
                          </p>
                          <p className="text-sm text-gray-600">{req.investor.email}</p>
                          <p className="text-xs text-gray-500">Created: {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </td>
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
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {req.payoutMethodId ? (
                            <>
                              <p className="font-medium text-gray-900">
                                {req.payoutMethodId.methodName || req.payoutMethodId.type?.toUpperCase() || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {req.payoutMethodId.accountNumber || req.payoutMethodId.upiId || req.payoutMethodId.details || "N/A"}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400">No payout method</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {req.transactionId && (
                            <p className="text-sm text-gray-900 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                              {req.transactionId}
                            </p>
                          )}
                          {req.paymentDate && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              {new Date(req.paymentDate).toLocaleDateString()}
                            </p>
                          )}
                          {req.paymentReceipt && (
                            <a
                              href={`https://agricorus.onrender.com${req.paymentReceipt}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Receipt
                            </a>
                          )}
                          {!req.transactionId && !req.paymentDate && !req.paymentReceipt && (
                            <p className="text-sm text-gray-400">No payment info</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openModal(req)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between gap-3">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Manage Return Request</h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Request Details */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Request Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-500">Investor</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.investor.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.investor.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Investment ID</p>
                      <p className="font-semibold text-gray-900 font-mono">{selectedRequest.investmentId.slice(-12)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created At</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Return Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Amount Paid */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount paid"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Receipt (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {selectedRequest.paymentReceipt && (
                      <a
                        href={`https://agricorus.onrender.com${selectedRequest.paymentReceipt}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all duration-300"
                      >
                        <FileText className="w-4 h-4" />
                        View Current
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>

                {/* Admin Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Comment (Optional)
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Add any notes or comments..."
                    rows={4}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={updateReturnRequest}
                  disabled={updatingId === selectedRequest._id || uploadingReceipt}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingId === selectedRequest._id || uploadingReceipt ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </span>
                  ) : (
                    "Update Request"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReturnRequestsAdmin;
