import React, { useEffect, useState } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";
import {
  Smartphone,
  Plus,
  Edit3,
  Trash2,
  Star,
  CheckCircle,
  X,
  Loader2,
  QrCode,
  Shield,
  Zap,
  AlertCircle
} from "lucide-react";

interface UPIMethod {
  _id: string;
  name: string;
  upiId: string;
  isDefault: boolean;
  isVerified?: boolean;
  verifiedName?: string;
  verificationDate?: string;
}

export default function ManageUPI() {
  const [methods, setMethods] = useState<UPIMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", upiId: "", isDefault: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://agricorus.duckdns.org/api/payouts/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMethods(res.data.filter((m: any) => m.type === "upi"));
    } catch (err) {
      console.error("Error fetching UPI methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.upiId.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await axios.put(`https://agricorus.duckdns.org/api/payouts/${editingId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        showToast("UPI method updated successfully!", "success");
      } else {
        await axios.post("https://agricorus.duckdns.org/api/payouts/add-upi", form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        showToast("UPI method added successfully!", "success");
      }
      resetForm();
      fetchMethods();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", upiId: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (method: UPIMethod) => {
    setForm({ name: method.name, upiId: method.upiId, isDefault: method.isDefault });
    setEditingId(method._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this UPI method?")) return;
    try {
      await axios.delete(`https://agricorus.duckdns.org/api/payouts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      showToast("UPI method deleted successfully!", "success");
      fetchMethods();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  const handleVerify = async (id: string) => {
    try {
      setVerifying(id);
      const res = await axios.post(`https://agricorus.duckdns.org/api/payouts/verify-upi/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      showToast(res.data.message || "UPI verified successfully!", "success");
      fetchMethods();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Verification failed", "error");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <InvestorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg flex items-center gap-2 animate-fade-in text-sm sm:text-base ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
            <span className="line-clamp-2">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">UPI Payment Methods</h1>
                <p className="text-emerald-100 mt-0.5 sm:mt-1 text-xs sm:text-base">Manage your UPI IDs for quick payouts</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-emerald-600 rounded-lg sm:rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add UPI
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Instant Transfer</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">24/7 Available</p>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Secure Payments</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">Bank-level Security</p>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 flex items-center gap-3 sm:col-span-2 md:col-span-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Total UPI IDs</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{methods.length} Added</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  {editingId ? "Edit UPI Method" : "Add New UPI"}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name / Label</label>
                  <input
                    type="text"
                    placeholder="e.g., Personal GPay"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g., yourname@upi"
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm sm:text-base"
                  />
                </div>

                <label className="flex items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 rounded focus:ring-emerald-500 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Set as Default</p>
                    <p className="text-xs sm:text-sm text-gray-500">Use this UPI for all payouts</p>
                  </div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update UPI" : "Add UPI"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPI Cards List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin" />
          </div>
        ) : methods.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No UPI Methods Added</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Add your first UPI ID to receive instant payouts</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-medium hover:bg-emerald-700 transition text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Your First UPI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {methods.map((method) => (
              <div
                key={method._id}
                className={`bg-white rounded-xl sm:rounded-2xl border-2 p-4 sm:p-5 hover:shadow-lg transition-all ${
                  method.isDefault ? "border-emerald-500" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {method.isDefault && (
                    <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-1 truncate">{method.name}</h3>
                <p className="text-emerald-600 font-medium mb-2 text-sm sm:text-base truncate">{method.upiId}</p>

                {/* Verification Status */}
                {method.isVerified ? (
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 p-2 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-xs text-emerald-700 font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 p-2 bg-amber-50 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs text-amber-700 font-medium">Not Verified</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 sm:pt-4 border-t border-gray-100">
                  {!method.isVerified && (
                    <button
                      onClick={() => handleVerify(method._id)}
                      disabled={verifying === method._id}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 text-xs sm:text-sm font-medium"
                    >
                      {verifying === method._id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Verify
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(method)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-xs sm:text-sm font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(method._id)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-xs sm:text-sm font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}
