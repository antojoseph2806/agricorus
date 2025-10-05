import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from './LandownerDashboard';
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
  Zap
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
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

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
      if (err.response?.status === 401) alert("Unauthorized. Please login again.");
      console.error("Error fetching payouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!token) return alert("You are not logged in.");
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/payouts/${editingId}`, formData, axiosConfig);
      } else {
        await axios.post(`http://localhost:5000/api/payouts/add-${type}`, formData, axiosConfig);
      }
      setFormData({});
      setEditingId(null);
      fetchPayouts();
    } catch (err: any) {
      if (err.response?.status === 401) alert("Unauthorized. Please login again.");
      else console.error("Error saving payout:", err);
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
      if (err.response?.status === 401) alert("Unauthorized. Please login again.");
      else console.error("Error deleting payout:", err);
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
          background: 'linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Glowing Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 59, 59, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Header Section */}
          <div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                {type === "upi" ? <QrCode className="w-8 h-8 text-white" /> : <Banknote className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h1 
                  className="text-3xl font-bold text-white uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {type === "upi" ? "UPI Payout Methods" : "Bank Account Management"}
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage your {type === "upi" ? "UPI IDs" : "bank accounts"} for secure payment processing
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add/Edit Form Card */}
            <div className="lg:col-span-2">
              <div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-xl font-bold text-white uppercase tracking-wide"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {editingId ? "Edit Payout Method" : "Add New Payout Method"}
                  </h2>
                  {editingId && (
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {type === "upi" ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Display Name</label>
                        <input
                          type="text"
                          placeholder="Personal UPI, Business UPI, etc."
                          value={formData.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">UPI ID</label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          value={formData.upiId || ""}
                          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Account Holder</label>
                        <input
                          type="text"
                          placeholder="Full name as in bank records"
                          value={formData.accountHolderName || ""}
                          onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Account Number</label>
                        <input
                          type="text"
                          placeholder="Bank account number"
                          value={formData.accountNumber || ""}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="Bank IFSC code"
                          value={formData.ifscCode || ""}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Bank name"
                          value={formData.bankName || ""}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isDefault || false}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded border-2 transition-all duration-300 group-hover:scale-110 ${
                        formData.isDefault 
                          ? 'bg-red-500 border-red-500' 
                          : 'bg-white/10 border-white/20'
                      }`}>
                        {formData.isDefault && <CheckCircle className="w-5 h-5 text-white" />}
                      </div>
                    </div>
                    <span className="text-white font-medium">Set as default payout method</span>
                  </label>
                  
                  <button
                    onClick={handleAddOrUpdate}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 ${
                      isSubmitting
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
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

            {/* Info Sidebar */}
            <div className="lg:col-span-1">
              <div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">Security Info</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Your payout methods are secured with bank-level encryption and protected by our security systems.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300 text-sm">Instant payment processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">Encrypted data storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300 text-sm">PCI DSS compliant</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div 
                className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl border border-red-500/20 p-6"
              >
                <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Total Methods</span>
                    <span className="text-white font-bold">{payouts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Default Method</span>
                    <span className="text-green-400 font-bold">
                      {payouts.find(p => p.isDefault) ? 'Set' : 'Not Set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Methods List */}
          <div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl mt-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          >
            <div className="px-8 py-6 border-b border-white/10">
              <h2 
                className="text-xl font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Saved {type === "upi" ? "UPI Methods" : "Bank Accounts"} 
                <span className="text-red-400 ml-2">({payouts.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-white/40 mb-4">
                  <CreditCard className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No payout methods added</h3>
                <p className="text-gray-400">Add your first {type === "upi" ? "UPI method" : "bank account"} to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-8 text-gray-400 font-semibold uppercase tracking-wide text-sm">
                        {type === "upi" ? "Name" : "Account Holder"}
                      </th>
                      <th className="text-left py-4 px-8 text-gray-400 font-semibold uppercase tracking-wide text-sm">
                        {type === "upi" ? "UPI ID" : "Account Number"}
                      </th>
                      <th className="text-left py-4 px-8 text-gray-400 font-semibold uppercase tracking-wide text-sm">
                        Bank Details
                      </th>
                      <th className="text-left py-4 px-8 text-gray-400 font-semibold uppercase tracking-wide text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-8 text-gray-400 font-semibold uppercase tracking-wide text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group">
                        <td className="py-4 px-8">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/10 group-hover:scale-110 transition-transform duration-300">
                              {type === "upi" ? <QrCode className="w-4 h-4 text-white" /> : <Banknote className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{p.name || p.accountHolderName}</p>
                              <p className="text-gray-400 text-sm">{type === "upi" ? "UPI" : "Bank Account"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-8">
                          <p className="text-white font-mono text-sm">{p.upiId || p.accountNumber}</p>
                        </td>
                        <td className="py-4 px-8">
                          <p className="text-gray-300 text-sm">{p.bankName || "N/A"}</p>
                          {p.ifscCode && <p className="text-gray-400 text-xs">IFSC: {p.ifscCode}</p>}
                        </td>
                        <td className="py-4 px-8">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                            p.isDefault 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {p.isDefault ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {p.isDefault ? 'Default' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-8">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-300 group-hover:scale-110"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 group-hover:scale-110"
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
            )}
          </div>
        </div>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        `}</style>
      </div>
    </Layout>
  );
};