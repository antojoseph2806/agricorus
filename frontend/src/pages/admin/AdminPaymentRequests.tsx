// src/pages/admin/AdminPaymentRequests.tsx
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
  MapPin,
  DollarSign,
  Eye,
  X
} from "lucide-react";

// Types
interface PayoutMethod {
  _id: string;
  type: "upi" | "bank";
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  name?: string;
}

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface Lease {
  _id: string;
  land: string;
  durationMonths: number;
  pricePerMonth: number;
  status: string;
}

interface PaymentRequest {
  _id: string;
  lease: Lease;
  land: string;
  farmer: Farmer;
  owner: Owner;
  amount: number;
  status: "pending" | "paid" | "rejected" | "canceled" | "approved";
  requestedAt: string;
  payoutMethod: PayoutMethod;
  adminNote?: string;
  reviewedAt?: string;
  paymentReceipt?: string;
  transactionId?: string;
  paymentDate?: string;
}

// Component
const AdminPaymentRequests: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // Modal form state
  const [modalStatus, setModalStatus] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://agricorus.duckdns.org/api/payment-requests/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(data.paymentRequests || []);
      setFilteredRequests(data.paymentRequests || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to fetch payment requests");
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
  const openModal = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setModalStatus(request.status);
    setAdminNote(request.adminNote || "");
    setTransactionId(request.transactionId || "");
    setPaymentDate(request.paymentDate ? new Date(request.paymentDate).toISOString().split('T')[0] : "");
    setReceiptFile(null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setModalStatus("");
    setAdminNote("");
    setTransactionId("");
    setPaymentDate("");
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
        `https://agricorus.duckdns.org/api/payment-requests/admin/${requestId}/upload-receipt`,
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
      toast.error(err?.response?.data?.error || "Failed to upload receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Update payment request
  const updatePaymentRequest = async () => {
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
        `https://agricorus.duckdns.org/api/payment-requests/admin/${selectedRequest._id}`,
        {
          status: modalStatus,
          adminNote,
          transactionId,
          paymentDate: paymentDate || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data.message);
      
      // Update the request in state
      setRequests(prev =>
        prev.map(r => r._id === selectedRequest._id ? { 
          ...r, 
          status: modalStatus as any,
          adminNote,
          transactionId,
          paymentDate,
          reviewedAt: new Date().toISOString()
        } : r)
      );

      closeModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update request");
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
      rejected: { icon: XCircle, color: "bg-red-100 text-red-800 border-red-300", label: "Rejected" },
      canceled: { icon: AlertCircle, color: "bg-gray-100 text-gray-800 border-gray-300", label: "Canceled" },
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
    const headers = ["Request ID", "Owner", "Farmer", "Amount", "Status", "Requested At", "Transaction ID", "Payment Date"];
    const csvData = filteredRequests.map(req => [
      req._id.slice(-8),
      req.owner.name,
      req.farmer.name,
      `₹${req.amount}`,
      req.status,
      new Date(req.requestedAt).toLocaleDateString(),
      req.transactionId || "N/A",
      req.paymentDate ? new Date(req.paymentDate).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-requests-${new Date().toISOString().split('T')[0]}.csv`;
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
                Lease Payment Requests
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage and process landowner payment requests
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Filter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Filter</h3>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
          {[
            { label: "Total", count: requests.length, color: "bg-blue-100", icon: FileText },
            { label: "Pending", count: requests.filter(r => r.status === "pending").length, color: "bg-yellow-100", icon: Clock },
            { label: "Approved", count: requests.filter(r => r.status === "approved").length, color: "bg-blue-100", icon: CheckCircle },
            { label: "Paid", count: requests.filter(r => r.status === "paid").length, color: "bg-green-100", icon: CheckCircle },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs sm:text-sm uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
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
            <div className="text-center py-12 sm:py-16 px-4">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No payment requests found</h3>
              <p className="text-sm sm:text-base text-gray-600">No requests match your current filters.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <div key={req._id} className="p-4 hover:bg-gray-50 transition-all duration-300">
                    <div className="space-y-3">
                      {/* Owner Info */}
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          {req.owner.name}
                        </p>
                        <p className="text-sm text-gray-600">{req.owner.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Farmer: {req.farmer.name}</p>
                      </div>

                      {/* Amount & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <span className="text-lg font-bold text-gray-900">₹{req.amount.toLocaleString()}</span>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>

                      {/* Payout Method */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Payout Method</p>
                        <p className="font-medium text-gray-900">{req.payoutMethod.type.toUpperCase()}</p>
                        <p className="text-sm text-gray-600">
                          {req.payoutMethod.type === "upi" 
                            ? req.payoutMethod.upiId 
                            : `${req.payoutMethod.bankName}`}
                        </p>
                      </div>

                      {/* Payment Info */}
                      {(req.transactionId || req.paymentDate || req.paymentReceipt) && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-2">Payment Info</p>
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
                                href={`https://agricorus.duckdns.org${req.paymentReceipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                View Receipt
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => openModal(req)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Manage Request
                      </button>

                      {/* Date */}
                      <p className="text-xs text-gray-500 text-center">
                        Requested: {new Date(req.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold uppercase tracking-wide text-sm">Request Details</th>
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
                            {req.owner.name}
                          </p>
                          <p className="text-sm text-gray-600">{req.owner.email}</p>
                          <p className="text-xs text-gray-500">Farmer: {req.farmer.name}</p>
                          <p className="text-xs text-gray-500">Requested: {new Date(req.requestedAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <span className="text-xl font-bold text-gray-900">₹{req.amount.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{req.payoutMethod.type.toUpperCase()}</p>
                          <p className="text-sm text-gray-600">
                            {req.payoutMethod.type === "upi" 
                              ? req.payoutMethod.upiId 
                              : `${req.payoutMethod.bankName}`}
                          </p>
                          {req.payoutMethod.type === "bank" && (
                            <p className="text-xs text-gray-500">A/C: {req.payoutMethod.accountNumber}</p>
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
                              href={`https://agricorus.duckdns.org${req.paymentReceipt}`}
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
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Manage Payment Request</h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Request Details */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">Request Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Owner</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.owner.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Farmer</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.farmer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-semibold text-gray-900">₹{selectedRequest.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Requested At</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedRequest.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                  </select>
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
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Receipt (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {selectedRequest.paymentReceipt && (
                      <a
                        href={`https://agricorus.duckdns.org${selectedRequest.paymentReceipt}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 whitespace-nowrap"
                      >
                        <FileText className="w-4 h-4" />
                        View Current
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>

                {/* Admin Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Note (Optional)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add any notes or comments..."
                    rows={4}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={updatePaymentRequest}
                  disabled={updatingId === selectedRequest._id || uploadingReceipt}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingId === selectedRequest._id || uploadingReceipt ? (
                    <span className="flex items-center justify-center gap-2">
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

export default AdminPaymentRequests;
