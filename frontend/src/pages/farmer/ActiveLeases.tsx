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

  const getImageUrl = (path: string) => path?.startsWith('http') ? path : `http://localhost:5000/${path}`;
  const formatCurrency = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
  const getProgress = (l: Lease) => ((l.paymentsMade || 0) / (l.totalPayments || 1)) * 100;

  const fetchLeases = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/farmer/leases/active", { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch(`http://localhost:5000/api/payments/order/${leaseId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const order = await res.json();
      if (!order.orderId) { setAlert({ type: "error", message: "Failed to create order." }); return; }
      new window.Razorpay({
        key: order.key, amount: order.amount, currency: order.currency, name: "AgriCorus", order_id: order.orderId,
        handler: async (r: any) => {
          const v = await fetch("http://localhost:5000/api/payments/verify", {
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
      const res = await fetch("http://localhost:5000/api/disputes", {
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Active Leases</h1>
                <p className="text-gray-600 text-sm">Manage your land leases and payments</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-emerald-50 px-4 py-2 rounded-lg text-center">
                <span className="text-emerald-700 font-bold text-xl">{leases.length}</span>
                <p className="text-emerald-600 text-xs">Total</p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg text-center">
                <span className="text-blue-700 font-bold text-xl">{formatCurrency(leases.reduce((s, l) => s + (l.paymentsMade || 0) * l.pricePerMonth, 0))}</span>
                <p className="text-blue-600 text-xs">Paid</p>
              </div>
            </div>
          </div>
        </div>

        {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border rounded-lg focus:border-emerald-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Lease Cards */}
        {filteredLeases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Leases</h3>
            <p className="text-gray-600">You don't have any active leases at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredLeases.map(lease => (
              <div key={lease._id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all overflow-hidden group">
                {/* Image with overlay */}
                <div className="relative h-36">
                  {lease.land?.landPhotos?.[0] ? (
                    <img src={getImageUrl(lease.land.landPhotos[0])} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                      <PhotoIcon className="h-10 w-10 text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${lease.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {lease.status.toUpperCase()}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg line-clamp-1 drop-shadow">{lease.land?.title || "Untitled"}</h3>
                    <p className="text-white/80 text-xs flex items-center"><MapPinIcon className="h-3 w-3 mr-1" />{lease.land?.location?.address || "No address"}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-600">{lease.land?.sizeInAcres} acres • {lease.land?.soilType}</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(lease.pricePerMonth)}/mo</span>
                  </div>

                  {/* Payment Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Payment Progress</span>
                      <span className="font-semibold">{lease.paymentsMade || 0}/{lease.totalPayments || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${getProgress(lease)}%` }} />
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      <span>{lease.owner?.name || "Owner"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PhoneIcon className="h-3 w-3" />
                      <span>{lease.owner?.phone || "N/A"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {(lease.paymentsMade || 0) < (lease.totalPayments || 0) && (
                      <button onClick={() => handlePayment(lease._id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-all">
                        <CurrencyRupeeIcon className="h-4 w-4" />
                        Pay Next ({formatCurrency(lease.pricePerMonth)})
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedLeaseId(lease._id); setShowDisputeModal(true); }}
                        className="flex-1 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all">
                        Raise Dispute
                      </button>
                      {lease.agreementUrl && (
                        <a href={lease.agreementUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-all">
                          Agreement
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">Raise Dispute</h3>
                <button onClick={() => setShowDisputeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500">
                    <option value="">Select category</option>
                    <option value="payment">Payment Issue</option>
                    <option value="land_condition">Land Condition</option>
                    <option value="agreement">Agreement Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500" placeholder="Describe the issue..." />
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t">
                <button onClick={() => setShowDisputeModal(false)} className="flex-1 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                <button onClick={submitDispute} disabled={submitting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveLeases;
