import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon
} from "@heroicons/react/24/solid";
import {
  FunnelIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import AlertMessage from "../../components/AlertMessage";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Lease {
  _id: string;
  land?: {
    _id: string;
    title?: string;
    location?: { 
      address?: string;
      latitude?: number;
      longitude?: number;
    };
    sizeInAcres?: number;
    soilType?: string;
    waterSource?: string;
    accessibility?: string;
    leasePricePerMonth?: number;
    leaseDurationMonths?: number;
    landPhotos?: string[];
    landDocuments?: string[];
    status?: string;
    isApproved?: boolean;
  };
  farmer?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  owner?: { 
    _id: string;
    name?: string;
    email?: string; 
    phone?: string;
  };
  durationMonths: number;
  pricePerMonth: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  paymentsMade?: number;
  totalPayments?: number;
  agreementUrl?: string;
}

const ActiveLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreementLoading, setAgreementLoading] = useState<string | null>(null);

  // Helper function to get correct image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `http://localhost:5000/${imagePath}`;
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [showLeaseDetails, setShowLeaseDetails] = useState(false);

  // Alert state
  const [alert, setAlert] = useState<
    { type: "success" | "error" | "warning"; message: string } | null
  >(null);

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);

  /**
   * Enhanced agreement viewing with automatic generation for missing agreements
   */
  const handleViewAgreement = async (lease: Lease) => {
    if (lease.agreementUrl) {
      // Agreement exists, open it directly
      window.open(lease.agreementUrl, "_blank");
      return;
    }

    // Agreement doesn't exist, try to generate it
    if (lease.status === 'active') {
      try {
        setAgreementLoading(lease._id);
        
        // Try to access the agreement endpoint, which will generate it if missing
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/lease/${lease._id}/agreement`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Agreement was generated successfully, download it
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Lease_Agreement_${lease._id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Refresh the leases to get the updated agreement URL
          fetchLeases();
          
          setAlert({
            type: "success",
            message: "Agreement generated and downloaded successfully!"
          });
        } else {
          const errorData = await response.json();
          console.error("Agreement generation failed:", errorData);
          setAlert({
            type: "error",
            message: errorData.message || "Failed to generate agreement. Please contact support."
          });
        }
      } catch (error) {
        console.error("Error accessing agreement:", error);
        setAlert({
          type: "error",
          message: "Failed to access agreement. Please check your connection and try again."
        });
      } finally {
        setAgreementLoading(null);
      }
    } else {
      setAlert({
        type: "warning",
        message: `Agreement is not available. Lease status: ${lease.status}. Agreements are only available for active leases.`
      });
    }
  };
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<File[] | null>(null);
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [amountInvolved, setAmountInvolved] = useState<number | "">("");
  const [preferredResolution, setPreferredResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch leases function
  const fetchLeases = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({ type: "error", message: "You must be logged in." });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:5000/api/farmer/leases/active",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log("Active leases data:", data);
      if (data.length > 0) {
        console.log("First lease land data:", data[0].land);
        console.log("First lease landPhotos:", data[0].land?.landPhotos);
      }
      if (Array.isArray(data)) setLeases(data);
      else if (data.leases && Array.isArray(data.leases)) setLeases(data.leases);
      else setLeases([]);
    } catch (err) {
      console.error("Error fetching active leases", err);
      setAlert({
        type: "error",
        message: "Failed to load active leases. Please try again.",
      });
      setLeases([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leases on component mount
  useEffect(() => {
    fetchLeases();
  }, []);

  // Filter leases
  useEffect(() => {
    let filtered = leases;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(lease => 
        lease.land?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.land?.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lease.land?.soilType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(lease => lease.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      if (paymentFilter === "pending") {
        filtered = filtered.filter(lease => (lease.paymentsMade || 0) < (lease.totalPayments || 0));
      } else if (paymentFilter === "completed") {
        filtered = filtered.filter(lease => (lease.paymentsMade || 0) >= (lease.totalPayments || 0));
      }
    }

    setFilteredLeases(filtered);
  }, [searchQuery, statusFilter, paymentFilter, leases]);

  // Razorpay payment
  const handleMakePayment = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/payments/order/${leaseId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const orderData = await res.json();
      if (!orderData.orderId) {
        setAlert({ type: "error", message: "Failed to create payment order." });
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AgriCorus",
        description: `Lease Payment`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch(
            "http://localhost:5000/api/payments/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                leaseId,
              }),
            }
          );

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            setAlert({ type: "success", message: "✅ Payment successful!" });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setAlert({
              type: "error",
              message: "❌ Payment verification failed: " + verifyData.error,
            });
          }
        },
        theme: { color: "#10b981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error", err);
      setAlert({ type: "error", message: "Payment failed. Please try again." });
    }
  };

  // Raise dispute
  const handleRaiseDispute = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    setShowDisputeModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };

  const resetDisputeForm = () => {
    setReason("");
    setCategory("");
    setDetails("");
    setAttachments(null);
    setDateOfIncident("");
    setAmountInvolved("");
    setPreferredResolution("");
    setSelectedLeaseId(null);
  };

  const submitDispute = async () => {
    if (!category) {
      setAlert({ type: "warning", message: "Please select a category." });
      return;
    }
    if (!reason.trim()) {
      setAlert({ type: "warning", message: "Please enter a reason." });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      let body: any;
      let headers: any = { Authorization: `Bearer ${token}` };

      if (attachments?.length) {
        body = new FormData();
        body.append("leaseId", selectedLeaseId || "");
        body.append("category", category);
        body.append("reason", reason);
        if (details) body.append("details", details);
        if (dateOfIncident) body.append("dateOfIncident", dateOfIncident);
        if (amountInvolved !== "") body.append("amountInvolved", String(amountInvolved));
        if (preferredResolution) body.append("preferredResolution", preferredResolution);
        attachments.forEach((file) => body.append("attachments", file));
      } else {
        body = JSON.stringify({
          leaseId: selectedLeaseId,
          category,
          reason,
          details: details || undefined,
          dateOfIncident: dateOfIncident || undefined,
          amountInvolved: amountInvolved !== "" ? amountInvolved : undefined,
          preferredResolution: preferredResolution || undefined,
        });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch("http://localhost:5000/api/disputes", {
        method: "POST",
        headers,
        body,
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: "success", message: "✅ Dispute raised successfully!" });
        setShowDisputeModal(false);
        resetDisputeForm();
      } else {
        setAlert({ type: "error", message: "❌ " + (data.error || "Failed to raise dispute.") });
      }
    } catch (err) {
      setAlert({ type: "error", message: "Error raising dispute." });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "terminated":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentProgress = (lease: Lease) => {
    const paid = lease.paymentsMade || 0;
    const total = lease.totalPayments || 0;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  const getRemainingPayments = (lease: Lease) => {
    const paid = lease.paymentsMade || 0;
    const total = lease.totalPayments || 0;
    return Math.max(0, total - paid);
  };

  const getTotalLeaseValue = (lease: Lease) => {
    return lease.pricePerMonth * lease.durationMonths;
  };

  const getPaidAmount = (lease: Lease) => {
    return lease.pricePerMonth * (lease.paymentsMade || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-gray-900 text-xl font-semibold mb-2">Loading Leases</h3>
          <p className="text-gray-600">Fetching your active leases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-4">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Leases</h1>
              <div className="w-16 h-1 bg-emerald-500 rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            Manage your current land leases, track payments, and handle any issues that arise
          </p>
        </div>

        {alert && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search leases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 w-full transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="terminated">Terminated</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900"
            >
              <option value="all">All Payments</option>
              <option value="pending">Payment Due</option>
              <option value="completed">Fully Paid</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPaymentFilter("all");
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {leases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Leases</p>
                  <p className="text-2xl font-bold text-gray-900">{leases.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Leases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leases.filter(l => l.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(leases.reduce((sum, lease) => sum + getPaidAmount(lease), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leases.reduce((sum, lease) => sum + getRemainingPayments(lease), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl">🏞️</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {leases.length === 0 ? "No Active Leases" : "No Leases Found"}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              {leases.length === 0 
                ? "You don't have any active leases at the moment."
                : "No leases match your current filters. Try adjusting your search criteria."
              }
            </p>
            {leases.length === 0 && (
              <div className="mt-4 text-sm text-gray-500">
                Debug: Total leases fetched: {leases.length}
                <button 
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    const res = await fetch("http://localhost:5000/api/farmer/leases/debug", {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    const debugData = await res.json();
                    console.log("Debug lease data:", debugData);
                    window.alert(`Found ${debugData.total} total leases. Check console for details.`);
                  }}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Debug Leases
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeases.map((lease) => (
              <div
                key={lease._id}
                className="group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col"
              >
                {/* Image Section */}
                <div className="w-full h-48 relative flex-shrink-0">
                  {lease.land?.landPhotos?.length ? (
                    <img
                      src={getImageUrl(lease.land?.landPhotos?.[0] || '')}
                      alt={lease.land?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                      onError={(e) => {
                        console.log("Image failed to load:", lease.land?.landPhotos?.[0]);
                        console.log("Attempted URL:", getImageUrl(lease.land?.landPhotos?.[0] || ''));
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-t-xl">
                              <svg class="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span class="text-sm">No image available</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-t-xl">
                      <PhotoIcon className="h-12 w-12 mb-3" />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center border ${getStatusColor(lease.status)}`}>
                    {lease.status === 'active' && <CheckCircleIcon className="h-3 w-3 mr-1.5" />}
                    {lease.status === 'pending' && <ClockIcon className="h-3 w-3 mr-1.5" />}
                    {lease.status.toUpperCase()}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {lease.land?.title || "Untitled Lease"}
                      </h2>
                      
                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{lease.land?.location?.address || "No address provided"}</span>
                      </div>

                      {/* Land Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Size</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.land?.sizeInAcres || "N/A"} acres
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.land?.soilType || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.durationMonths} months
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(lease.pricePerMonth)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span className="font-semibold">Payment Progress</span>
                          <span className="font-semibold text-gray-900">
                            {lease.paymentsMade || 0} of {lease.totalPayments || 0} paid
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${getPaymentProgress(lease)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Paid: {formatCurrency(getPaidAmount(lease))}</span>
                          <span>Total: {formatCurrency(getTotalLeaseValue(lease))}</span>
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Landowner</p>
                        <p className="text-sm font-semibold text-blue-900">{lease.owner?.name || "N/A"}</p>
                        {lease.owner?.phone && (
                          <p className="text-xs text-blue-700 flex items-center mt-1">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            {lease.owner.phone}
                          </p>
                        )}
                      </div>

                      {/* Lease Dates */}
                      <div className="text-xs text-gray-500 mb-4">
                        <div className="flex items-center mb-1">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Started: {lease.createdAt ? formatDate(lease.createdAt) : "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4 border-t">
                      {getRemainingPayments(lease) > 0 ? (
                        <button
                          onClick={() => handleMakePayment(lease._id)}
                          className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 group/payment"
                        >
                          <BanknotesIcon className="h-4 w-4 mr-2" />
                          Pay Next Installment ({formatCurrency(lease.pricePerMonth)})
                          <ChevronRightIcon className="h-4 w-4 ml-2 group-hover/payment:translate-x-1 transition-transform duration-300" />
                        </button>
                      ) : (
                        <div className="w-full text-center py-3 bg-green-100 text-green-700 font-semibold rounded-lg border border-green-200">
                          <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                          Fully Paid
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setSelectedLease(lease);
                            setShowLeaseDetails(true);
                          }}
                          className="flex items-center justify-center px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-medium rounded-lg transition-all duration-300"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Details
                        </button>

                        <button
                          onClick={() => handleViewAgreement(lease)}
                          disabled={agreementLoading === lease._id}
                          className="flex items-center justify-center px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-medium rounded-lg transition-all duration-300 disabled:opacity-50"
                        >
                          {agreementLoading === lease._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                              Agreement
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => handleRaiseDispute(lease._id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-medium rounded-lg transition-all duration-300"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Raise Dispute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {filteredLeases.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white rounded-lg shadow-sm border px-6 py-3">
              <span className="text-gray-600 text-sm font-medium">
                Displaying <span className="text-gray-900 font-bold">{filteredLeases.length}</span> of <span className="text-gray-900 font-bold">{leases.length}</span> Leases
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lease Details Modal */}
      {showLeaseDetails && selectedLease && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Lease Details</h3>
                  <p className="text-sm text-gray-600">{selectedLease.land?.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLeaseDetails(false);
                  setSelectedLease(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Land Details */}
                <div className="space-y-6">
                  {/* Land Images */}
                  {selectedLease.land?.landPhotos && selectedLease.land.landPhotos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Land Photos</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedLease.land.landPhotos.slice(0, 4).map((photo, index) => (
                          <img
                            key={index}
                            src={getImageUrl(photo)}
                            alt={`Land photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-300"
                            onClick={() => window.open(getImageUrl(photo), '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Land Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Land Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{selectedLease.land?.sizeInAcres} acres</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil Type:</span>
                        <span className="font-medium">{selectedLease.land?.soilType}</span>
                      </div>
                      {selectedLease.land?.waterSource && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Water Source:</span>
                          <span className="font-medium">{selectedLease.land.waterSource}</span>
                        </div>
                      )}
                      {selectedLease.land?.accessibility && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accessibility:</span>
                          <span className="font-medium">{selectedLease.land.accessibility}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900">{selectedLease.land?.location?.address}</p>
                          {selectedLease.land?.location?.latitude && selectedLease.land?.location?.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${selectedLease.land.location.latitude},${selectedLease.land.location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
                            >
                              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                              View on Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Landowner Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Landowner</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">{selectedLease.owner?.name}</span>
                      </div>
                      {selectedLease.owner?.email && (
                        <div className="flex items-center mb-2">
                          <EnvelopeIcon className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-blue-800 text-sm">{selectedLease.owner.email}</span>
                        </div>
                      )}
                      {selectedLease.owner?.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-blue-800 text-sm">{selectedLease.owner.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Lease Details */}
                <div className="space-y-6">
                  {/* Lease Terms */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Lease Terms</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedLease.durationMonths} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="font-medium">{formatCurrency(selectedLease.pricePerMonth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-medium">{formatCurrency(getTotalLeaseValue(selectedLease))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLease.status)}`}>
                          {selectedLease.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">
                          {selectedLease.paymentsMade || 0} of {selectedLease.totalPayments || 0} payments
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getPaymentProgress(selectedLease)}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                          <p className="font-semibold text-green-600">{formatCurrency(getPaidAmount(selectedLease))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Remaining</p>
                          <p className="font-semibold text-orange-600">
                            {formatCurrency(getTotalLeaseValue(selectedLease) - getPaidAmount(selectedLease))}
                          </p>
                        </div>
                      </div>

                      {getRemainingPayments(selectedLease) > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600 mb-2">Next Payment Due:</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(selectedLease.pricePerMonth)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lease Timeline */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lease Started:</span>
                        <span className="font-medium">
                          {selectedLease.createdAt ? formatDate(selectedLease.createdAt) : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {selectedLease.updatedAt ? formatDate(selectedLease.updatedAt) : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {getRemainingPayments(selectedLease) > 0 && (
                      <button
                        onClick={() => {
                          setShowLeaseDetails(false);
                          handleMakePayment(selectedLease._id);
                        }}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300"
                      >
                        <BanknotesIcon className="h-4 w-4 mr-2" />
                        Pay Next Installment ({formatCurrency(selectedLease.pricePerMonth)})
                      </button>
                    )}

                    <button
                      onClick={() => handleViewAgreement(selectedLease)}
                      disabled={agreementLoading === selectedLease._id}
                      className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 border text-gray-700 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {agreementLoading === selectedLease._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating Agreement...
                        </>
                      ) : (
                        <>
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          {selectedLease.agreementUrl ? 'Download Agreement' : 'Generate Agreement'}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowLeaseDetails(false);
                        handleRaiseDispute(selectedLease._id);
                      }}
                      className="w-full flex items-center justify-center px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold rounded-lg transition-all duration-300"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      Raise Dispute
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowDisputeModal(false);
                resetDisputeForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 border border-red-200">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Report Issue</h3>
            </div>

            <div className="space-y-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 transition-all duration-300"
              >
                <option value="">Select Issue Category</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Land Access Issue">Land Access Issue</option>
                <option value="Land Condition Issue">Land Condition Issue</option>
                <option value="Agreement Violation">Agreement Violation</option>
                <option value="Communication Issue">Communication Issue</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 resize-none transition-all duration-300"
                rows={3}
                placeholder="Describe the issue in detail..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <textarea
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 resize-none transition-all duration-300"
                rows={2}
                placeholder="Additional details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />

              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <input
                  type="date"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 transition-all duration-300"
                  value={dateOfIncident}
                  onChange={(e) => setDateOfIncident(e.target.value)}
                  placeholder="Date of incident"
                />
              </div>

              <input
                type="number"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Amount involved (optional)"
                value={amountInvolved}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountInvolved(val === "" ? "" : Number(val));
                }}
              />

              <input
                type="text"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Preferred resolution (optional)"
                value={preferredResolution}
                onChange={(e) => setPreferredResolution(e.target.value)}
              />

              <div>
                <label className="block text-sm text-gray-700 mb-2 font-semibold">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all duration-300"
                />
                {attachments && attachments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {attachments.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  resetDisputeForm();
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={submitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Issue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveLeases;