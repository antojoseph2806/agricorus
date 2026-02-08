import { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "./LandownerDashboard";
import {
  CreditCard,
  Plus,
  Trash2,
  Shield,
  CheckCircle,
  Banknote,
  QrCode,
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
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 mb-4 sm:mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-emerald-600">
                {type === "upi" ? (
                  <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                ) : (
                  <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {type === "upi" ? "UPI Payout Methods" : "Bank Account Management"}
                </h1>
                <p className="text-sm sm:text-lg text-gray-600">
                  Manage your {type === "upi" ? "UPI IDs" : "bank accounts"} for
                  secure payment processing
                </p>
              </div>
            </div>
          </div>

          {/* Add/Edit Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {editingId ? "Edit Payout Method" : "Add New Payout Method"}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          placeholder="Bank name"
                          value={formData.bankName || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, bankName: e.target.value })
                          }
                          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Default toggle + Submit */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault || false}
                      onChange={(e) =>
                        setFormData({ ...formData, isDefault: e.target.checked })
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm sm:text-base text-gray-700">Set as default</span>
                  </label>

                  <button
                    onClick={handleAddOrUpdate}
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-bold text-white transition-all shadow-sm ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        {editingId ? "Update Method" : "Add Method"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Security Info
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Your payout methods are securely encrypted and PCI DSS compliant.
                </p>
              </div>

              <div className="bg-emerald-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-emerald-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-gray-700">
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
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 mt-4 sm:mt-8 overflow-hidden shadow-sm">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Saved {type === "upi" ? "UPI Methods" : "Bank Accounts"}{" "}
                <span className="text-emerald-600 ml-2">({payouts.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  No payout methods added
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Add your first {type === "upi" ? "UPI ID" : "bank account"} to get
                  started.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-3 px-8 text-left font-semibold">
                        {type === "upi" ? "Name" : "Account Holder"}
                      </th>
                      <th className="py-3 px-8 text-left font-semibold">
                        {type === "upi" ? "UPI ID" : "Account Number"}
                      </th>
                      <th className="py-3 px-8 text-left font-semibold">
                        {type === "upi" ? "Provider" : "Bank Details"}
                      </th>
                      <th className="py-3 px-8 text-left font-semibold">Status</th>
                      <th className="py-3 px-8 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr
                        key={p._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="py-4 px-8 text-gray-900 font-medium">
                          {p.name || p.accountHolderName || "—"}
                        </td>
                        <td className="py-4 px-8 text-gray-700">
                          {p.upiId || p.accountNumber || "—"}
                        </td>
                        <td className="py-4 px-8 text-gray-600">
                          {type === "bank" ? (
                            <>
                              {p.bankName || "N/A"} {p.ifscCode && `(${p.ifscCode})`}
                            </>
                          ) : (
                            // Extract UPI provider from UPI ID (e.g., "name@paytm" -> "Paytm")
                            p.upiId ? (
                              <span className="capitalize">
                                {p.upiId.split("@")[1] || "UPI"}
                              </span>
                            ) : (
                              "—"
                            )
                          )}
                        </td>
                        <td className="py-4 px-8">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              p.isDefault
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {p.isDefault ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Default
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" /> Active
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-8">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                              title="Delete"
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

              {/* Mobile Cards */}
              <div className="md:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
                {payouts.map((p) => (
                  <div
                    key={p._id}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {p.name || p.accountHolderName || "—"}
                        </p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {p.upiId || p.accountNumber || "—"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0 ${
                          p.isDefault
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {p.isDefault ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" /> Default
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                          </>
                        )}
                      </span>
                    </div>

                    {type === "bank" && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500">Bank Details</p>
                        <p className="text-sm text-gray-900 font-medium">
                          {p.bankName || "N/A"} {p.ifscCode && `(${p.ifscCode})`}
                        </p>
                      </div>
                    )}

                    {type === "upi" && p.upiId && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-xs text-gray-500">Provider</p>
                        <p className="text-sm text-gray-900 font-medium capitalize">
                          {p.upiId.split("@")[1] || "UPI"}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(p._id)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
