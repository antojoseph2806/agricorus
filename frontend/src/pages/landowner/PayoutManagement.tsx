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
      const res = await axios.get("https://agricorus.onrender.com/api/payouts", axiosConfig);
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
          `https://agricorus.onrender.com/api/payouts/${editingId}`,
          formData,
          axiosConfig
        );
      } else {
        await axios.post(
          `https://agricorus.onrender.com/api/payouts/add-${type}`,
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
      await axios.delete(`https://agricorus.onrender.com/api/payouts/${id}`, axiosConfig);
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
      <div
        className="min-h-screen p-6 relative"
        style={{
          background: "linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 59, 59, 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          ></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                {type === "upi" ? (
                  <QrCode className="w-8 h-8 text-white" />
                ) : (
                  <Banknote className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
                  {type === "upi" ? "UPI Payout Methods" : "Bank Account Management"}
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage your {type === "upi" ? "UPI IDs" : "bank accounts"} for
                  secure payment processing
                </p>
              </div>
            </div>
          </div>

          {/* Add/Edit Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                    {editingId ? "Edit Payout Method" : "Add New Payout Method"}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-white"
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
                        <label className="block text-sm font-semibold text-white mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          placeholder="Personal UPI, Business UPI, etc."
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          value={formData.upiId || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, upiId: e.target.value })
                          }
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
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
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault || false}
                      onChange={(e) =>
                        setFormData({ ...formData, isDefault: e.target.checked })
                      }
                    />
                    <span className="text-white">Set as default</span>
                  </label>

                  <button
                    onClick={handleAddOrUpdate}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${
                      isSubmitting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:scale-105"
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
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white uppercase">
                    Security Info
                  </h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Your payout methods are securely encrypted and PCI DSS compliant.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 p-6 rounded-2xl border border-red-500/20">
                <h3 className="text-lg font-bold text-white mb-4 uppercase">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>Total Methods: <b className="text-white">{payouts.length}</b></p>
                  <p>
                    Default Method:{" "}
                    <b className="text-green-400">
                      {payouts.find((p) => p.isDefault) ? "Set" : "Not Set"}
                    </b>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 mt-8 overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white uppercase">
                Saved {type === "upi" ? "UPI Methods" : "Bank Accounts"}{" "}
                <span className="text-red-400 ml-2">({payouts.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-16 h-16 mx-auto text-white/40 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  No payout methods added
                </h3>
                <p className="text-gray-400">
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
