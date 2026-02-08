import React, { useEffect, useState } from "react";
import {
  DocumentTextIcon, MapPinIcon, CurrencyRupeeIcon, UserIcon, PhoneIcon, PhotoIcon, XMarkIcon
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AlertMessage from "../../components/AlertMessage";

declare global { interface Window { Razorpay: any; } }

interface Lease {
  _id: string;
  land?: {
    _id: string; title?: string;
    location?: { address?: string };
    sizeInAcres?: number; soilType?: string;
    landPhotos?: string[];
  };
  owner?: { _id: string; name?: string; email?: string; phone?: string };
  durationMonths: number; pricePerMonth: number; status: string;
  createdAt?: string; paymentsMade?: number; totalPayments?: number; agreementUrl?: string;
}

const ActiveLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [alert, setAlert] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getImageUrl = (path: string) => path?.startsWith('http') ? path : `https://agricorus.onrender.com/${path}`;
  const formatCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  const getProgress = (l: Lease) => ((l.paymentsMade || 0) / (l.totalPayments || 1)) * 100;

  const fetchLeases = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://agricorus.onrender.com/api/farmer/leases/active", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLeases(Array.isArray(data) ? data : data.leases || []);
    } catch { setLeases([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLeases(); }, []);
  useEffect(() => {
    let f = leases;
    if (searchQuery) f = f.filter(l => l.land?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || l.land?.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (statusFilter !== "all") f = f.filter(l => l.status === statusFilter);
    setFilteredLeases(f);
  }, [searchQuery, statusFilter, leases]);

  const handlePayment = async (leaseId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://agricorus.onrender.com/api/payments/order/${leaseId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const order = await res.json();
      if (!order.orderId) { setAlert({ type: "error", message: "Failed to create order." }); return; }
      new window.Razorpay({
        key: order.key, amount: order.amount, currency: order.currency, name: "AgriCorus", order_id: order.orderId,
        handler: async (r: any) => {
          const v = await fetch("https://agricorus.onrender.com/api/payments/verify", {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature, leaseId })
          });
          if (v.ok) { setAlert({ type: "success", message: "Payment successful!" }); setTimeout(() => window.location.reload(), 1500); }
          else setAlert({ type: "error", message: "Payment verification failed." });
        }, theme: { color: "#10b981" }
      }).open();
    } catch { setAlert({ type: "error", message: "Payment failed." }); }
  };

  const submitDispute = async () => {
    if (!category || !reason.trim()) { setAlert({ type: "warning", message: "Fill required fields." }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("https://agricorus.onrender.com/api/disputes", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ leaseId: selectedLeaseId, category, reason })
      });
      if (res.ok) { setAlert({ type: "success", message: "Dispute raised!" }); setShowDisputeModal(false); setCategory(""); setReason(""); }
      else setAlert({ type: "error", message: "Failed to raise dispute." });
    } catch { setAlert({ type: "error", message: "Error." }); }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading leases...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section with Gradient */}
      <div className="relative mb-8">
        {/* Background Gradient Banner */}
        <div className="h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        </div>

        {/* Icon Badge */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <DocumentTextIcon className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="text-center mt-16 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Active Leases</h1>
        <p className="text-gray-500 mt-2">Manage and monitor agricultural lease operations</p>
      </div>

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Requests', value: leases.length, icon: DocumentTextIcon, color: 'from-blue-400 to-blue-600' },
          { label: 'Pending', value: 0, icon: DocumentTextIcon, color: 'from-amber-400 to-amber-600' },
          { label: 'Active', value: leases.filter(l => l.status === 'active').length, icon: DocumentTextIcon, color: 'from-emerald-400 to-emerald-600' },
          { label: 'Completed', value: leases.filter(l => l.status === 'completed').length, icon: DocumentTextIcon, color: 'from-purple-400 to-purple-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search by land title or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-gray-700">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Lease Cards */}
        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <DocumentTextIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Active Leases</h3>
            <p className="text-gray-500 max-w-md mx-auto">You don't have any active leases at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLeases.map(lease => (
              <div key={lease._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all overflow-hidden group">
                {/* Image with overlay */}
                <div className="relative h-48">
                  {lease.land?.landPhotos?.[0] ? (
                    <img src={getImageUrl(lease.land.landPhotos[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${lease.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {lease.status.toUpperCase()}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-xl line-clamp-1 drop-shadow-lg mb-1">{lease.land?.title || "Untitled"}</h3>
                    <p className="text-white/90 text-sm flex items-center"><MapPinIcon className="h-4 w-4 mr-1" />{lease.land?.location?.address || "No address"}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">{lease.land?.sizeInAcres} acres • {lease.land?.soilType}</span>
                    <span className="font-bold text-emerald-600 text-lg">{formatCurrency(lease.pricePerMonth)}/mo</span>
                  </div>

                  {/* Payment Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">Payment Progress</span>
                      <span className="font-bold text-emerald-600">{lease.paymentsMade || 0}/{lease.totalPayments || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all shadow-sm" style={{ width: `${getProgress(lease)}%` }} />
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">{lease.owner?.name || "Owner"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{lease.owner?.phone || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {(lease.paymentsMade || 0) < (lease.totalPayments || 0) && (
                      <button onClick={() => handlePayment(lease._id)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25">
                        <CurrencyRupeeIcon className="h-5 w-5" />
                        Pay Next ({formatCurrency(lease.pricePerMonth)})
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedLeaseId(lease._id); setShowDisputeModal(true); }}
                        className="flex-1 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-500 hover:bg-red-50 rounded-xl transition-all">
                        Raise Dispute
                      </button>
                      {lease.agreementUrl && (
                        <a href={lease.agreementUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2.5 text-sm font-semibold text-blue-600 border-2 border-blue-500 hover:bg-blue-50 rounded-xl text-center transition-all">
                          View Agreement
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Raise Dispute</h3>
                <button onClick={() => setShowDisputeModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-gray-700">
                    <option value="">Select category</option>
                    <option value="payment">Payment Issue</option>
                    <option value="land_condition">Land Condition</option>
                    <option value="agreement">Agreement Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-gray-700" placeholder="Describe the issue in detail..." />
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button onClick={() => setShowDisputeModal(false)} className="flex-1 py-3 text-gray-700 border-2 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-all">Cancel</button>
                <button onClick={submitDispute} disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-all shadow-lg shadow-red-500/25">
                  {submitting ? "Submitting..." : "Submit Dispute"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default ActiveLeases;
