import React, { useEffect, useState } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Star,
  CheckCircle,
  X,
  Loader2,
  CreditCard,
  Shield,
  Clock,
  AlertCircle,
  Landmark
} from "lucide-react";

interface BankMethod {
  _id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  isDefault: boolean;
}

export default function ManageBank() {
  const [methods, setMethods] = useState<BankMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    isDefault: false,
  });
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
      const res = await axios.get("https://agricorus.onrender.com/api/payouts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMethods(res.data.filter((m: any) => m.type === "bank"));
    } catch (err) {
      console.error("Error fetching bank methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleSubmit = async () => {
    if (!form.accountHolderName.trim() || !form.accountNumber.trim() || !form.ifscCode.trim() || !form.bankName.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await axios.put(`https://agricorus.onrender.com/api/payouts/${editingId}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        showToast("Bank account updated successfully!", "success");
      } else {
        await axios.post("https://agricorus.onrender.com/api/payouts/add-bank", form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        showToast("Bank account added successfully!", "success");
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
    setForm({
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (method: BankMethod) => {
    setForm({
      accountHolderName: method.accountHolderName,
      accountNumber: method.accountNumber,
      ifscCode: method.ifscCode,
      bankName: method.bankName,
      isDefault: method.isDefault,
    });
    setEditingId(method._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) return;
    try {
      await axios.delete(`https://agricorus.onrender.com/api/payouts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      showToast("Bank account deleted successfully!", "success");
      fetchMethods();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  const maskAccountNumber = (accNum: string) => {
    if (accNum.length <= 4) return accNum;
    return "••••" + accNum.slice(-4);
  };

  return (
    <InvestorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in ${
            toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bank Accounts</h1>
                <p className="text-blue-100 mt-1">Manage your bank accounts for payouts</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Bank
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processing Time</p>
              <p className="font-semibold text-gray-800">1-3 Business Days</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Security</p>
              <p className="font-semibold text-gray-800">Bank-grade Encryption</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Landmark className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Accounts</p>
              <p className="font-semibold text-gray-800">{methods.length} Linked</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? "Edit Bank Account" : "Add New Bank Account"}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="As per bank records"
                    value={form.accountHolderName}
                    onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g., SBIN0001234"
                      value={form.ifscCode}
                      onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g., State Bank of India"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Set as Default</p>
                    <p className="text-sm text-gray-500">Use this account for all payouts</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update Account" : "Add Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bank Cards List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : methods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bank Accounts Added</h3>
            <p className="text-gray-500 mb-6">Link your bank account to receive payouts securely</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Your First Bank Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <div
                key={method._id}
                className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-lg transition-all ${
                  method.isDefault ? "border-blue-500" : "border-gray-100"
                }`}
              >
                {/* Card Header - Bank Style */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-6 h-6" />
                      <span className="font-medium">{method.bankName}</span>
                    </div>
                    {method.isDefault && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500 text-yellow-900 text-xs font-semibold rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-xl tracking-wider mb-3">
                    {maskAccountNumber(method.accountNumber)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">Account Holder</p>
                      <p className="font-medium">{method.accountHolderName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">IFSC</p>
                      <p className="font-medium">{method.ifscCode}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 flex items-center gap-2 bg-gray-50">
                  <button
                    onClick={() => handleEdit(method)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-gray-600 hover:bg-white rounded-lg transition border border-transparent hover:border-gray-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(method._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Note */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Your data is secure</p>
            <p className="text-sm text-blue-600">
              We use bank-grade encryption to protect your financial information. Your account details are never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
