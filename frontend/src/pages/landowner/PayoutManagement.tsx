import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "./LandownerDashboard";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Banknote,
  QrCode,
  Database,
  Zap,
} from "lucide-react";

interface PayoutMethod {
  _id: string;
  type: "upi" | "bank";
  name?: string;
  upiId?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isDefault: boolean;
}

export const PayoutManagement = ({ type }: { type: "upi" | "bank" }) => {
  const [payouts, setPayouts] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (!token) {
      alert("You are not logged in. Please login first.");
      return;
    }
    fetchPayouts();
  }, [type]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/payouts", axiosConfig);
      setPayouts(res.data.filter((p: PayoutMethod) => p.type === type));
    } catch (err: any) {
      console.error("Error fetching payouts:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized. Please login again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!token) return alert("You are not logged in.");

    if (type === "upi" && (!formData.name || !formData.upiId)) {
      return alert("Please fill in both name and UPI ID.");
    }

    if (
      type === "bank" &&
      (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName)
    ) {
      return alert("Please fill all bank account fields.");
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/payouts/${editingId}`,
          formData,
          axiosConfig
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/payouts/add-${type}`,
          formData,
          axiosConfig
        );
      }
      resetForm();
      fetchPayouts();
    } catch (err: any) {
      console.error("Error saving payout:", err);
      if (err.response?.status === 401) alert("Unauthorized. Please login again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (payout: PayoutMethod) => {
    setEditingId(payout._id);
    setFormData(payout);
  };

  const handleDelete = async (id: string) => {
    if (!token) return alert("You are not logged in.");
    if (!window.confirm("Are you sure you want to delete this payout method?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/payouts/${id}`, axiosConfig);
      fetchPayouts();
    } catch (err: any) {
      console.error("Error deleting payout:", err);
      if (err.response?.status === 401) alert("Unauthorized. Please login again.");
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-emerald-600">
                {type === "upi" ? (
                  <QrCode className="w-8 h-8 text-white" />
                ) : (
                  <Banknote className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {type === "upi" ? "UPI Payout Methods" : "Bank Account Management"}
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your {type === "upi" ? "UPI IDs" : "bank accounts"} for
                  secure payment processing
                </p>
              </div>
            </div>
          </div>

          {/* Add/Edit Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Edit Payout Method" : "Add New Payout Method"}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {type === "upi" ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          placeholder="Personal UPI, Business UPI, etc."
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          value={formData.upiId || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, upiId: e.target.value })
                          }
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Account Holder
                        </label>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={formData.accountHolderName || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              accountHolderName: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="Bank account number"
                          value={formData.accountNumber || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              accountNumber: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          placeholder="Bank IFSC"
                          value={formData.ifscCode || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ifscCode: e.target.value,
                            })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          placeholder="Bank name"
                          value={formData.bankName || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, bankName: e.target.value })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Default toggle + Submit */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault || false}
                      onChange={(e) =>
                        setFormData({ ...formData, isDefault: e.target.checked })
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700">Set as default</span>
                  </label>

                  <button
                    onClick={handleAddOrUpdate}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-sm ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        {editingId ? "Update Method" : "Add Method"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Security Info
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Your payout methods are securely encrypted and PCI DSS compliant.
                </p>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Total Methods: <b className="text-gray-900">{payouts.length}</b></p>
                  <p>
                    Default Method:{" "}
                    <b className="text-emerald-700">
                      {payouts.find((p) => p.isDefault) ? "Set" : "Not Set"}
                    </b>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white rounded-2xl border border-gray-200 mt-8 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                Saved {type === "upi" ? "UPI Methods" : "Bank Accounts"}{" "}
                <span className="text-emerald-600 ml-2">({payouts.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No payout methods added
                </h3>
                <p className="text-gray-600">
                  Add your first {type === "upi" ? "UPI ID" : "bank account"} to get
                  started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-3 px-8 text-left">
                        {type === "upi" ? "Name" : "Account Holder"}
                      </th>
                      <th className="py-3 px-8 text-left">
                        {type === "upi" ? "UPI ID" : "Account Number"}
                      </th>
                      <th className="py-3 px-8 text-left">Details</th>
                      <th className="py-3 px-8 text-left">Status</th>
                      <th className="py-3 px-8 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="py-4 px-8 text-white">
                          {p.name || p.accountHolderName}
                        </td>
                        <td className="py-4 px-8 text-gray-300">
                          {p.upiId || p.accountNumber}
                        </td>
                        <td className="py-4 px-8 text-gray-400">
                          {p.bankName || "N/A"} {p.ifscCode && `(${p.ifscCode})`}
                        </td>
                        <td className="py-4 px-8">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              p.isDefault
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            }`}
                          >
                            {p.isDefault ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Default
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" /> Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-8">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      </div>
    </Layout>
  );
};
