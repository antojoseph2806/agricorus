import React, { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Wallet,
  ArrowDownToLine,
  Building2,
  Smartphone,
  TrendingUp,
  Shield,
  Clock,
  AlertCircle,
  ChevronRight,
  Banknote,
  Info
} from "lucide-react";
import { InvestorLayout } from "./InvestorLayout";
import { Link } from "react-router-dom";

interface Investment {
  _id: string;
  amount: number;
  expectedProfit?: number;
  projectId: {
    _id: string;
    title: string;
    status: string;
  };
  createdAt: string;
}

interface PayoutMethod {
  _id: string;
  type: "bank" | "upi" | "wallet";
  accountNumber?: string;
  upiId?: string;
  walletId?: string;
  name?: string;
  bankName?: string;
  accountHolderName?: string;
  isDefault?: boolean;
}

const InvestorReturnRequest: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const selectedInv = investments.find((inv) => inv._id === selectedInvestment);
  const selectedPayout = payoutMethods.find((m) => m._id === selectedPayoutMethod);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to continue.");
          return;
        }

        const [invRes, payoutRes] = await Promise.all([
          axios.get("http://localhost:5000/api/project-payments/investments/history", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/payouts/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setInvestments(invRes.data.investments || []);
        
        const normalized = (payoutRes.data || []).map((item: any) => ({
          ...item,
          type: item.type || item.methodType,
        }));
        setPayoutMethods(normalized);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedInvestment || !selectedPayoutMethod) {
      toast.warning("Please select both investment and payout method.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/investor/return-requests",
        { investmentId: selectedInvestment, payoutMethodId: selectedPayoutMethod },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message || "Return request submitted successfully!");
      setSelectedInvestment("");
      setSelectedPayoutMethod("");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvestorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <ToastContainer position="top-right" autoClose={4000} theme="light" />

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <ArrowDownToLine className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Request Investment Return</h1>
              <p className="text-amber-100 mt-1">Withdraw your investment returns securely</p>
            </div>
          </div>
        </div>

        {fetchingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Investment Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Investment
                    </label>
                    {investments.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No investments found</p>
                        <Link to="/investor/projects" className="text-amber-600 text-sm hover:underline mt-1 inline-block">
                          Browse investment projects →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {investments.map((inv) => (
                          <label
                            key={inv._id}
                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedInvestment === inv._id
                                ? "border-amber-500 bg-amber-50"
                                : "border-gray-100 hover:border-amber-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="investment"
                              value={inv._id}
                              checked={selectedInvestment === inv._id}
                              onChange={(e) => setSelectedInvestment(e.target.value)}
                              className="w-5 h-5 text-amber-500 focus:ring-amber-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-800">
                                  {inv.projectId?.title || "Unnamed Project"}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  inv.projectId.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : inv.projectId.status === "active"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}>
                                  {inv.projectId.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="font-medium text-amber-600">₹{inv.amount.toLocaleString()}</span>
                                {inv.expectedProfit && (
                                  <span className="text-emerald-600">+₹{inv.expectedProfit.toLocaleString()} profit</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payout Method Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Payout Method
                    </label>
                    {payoutMethods.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No payout methods found</p>
                        <Link to="/investor/bank/manage" className="text-amber-600 text-sm hover:underline mt-1 inline-block">
                          Add a payout method →
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {payoutMethods.map((method) => (
                          <label
                            key={method._id}
                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedPayoutMethod === method._id
                                ? "border-amber-500 bg-amber-50"
                                : "border-gray-100 hover:border-amber-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payout"
                              value={method._id}
                              checked={selectedPayoutMethod === method._id}
                              onChange={(e) => setSelectedPayoutMethod(e.target.value)}
                              className="w-5 h-5 text-amber-500 focus:ring-amber-500"
                            />
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              method.type === "bank" ? "bg-blue-100" : "bg-emerald-100"
                            }`}>
                              {method.type === "bank" ? (
                                <Building2 className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Smartphone className="w-5 h-5 text-emerald-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800">
                                  {method.type === "bank"
                                    ? method.bankName || method.name || "Bank Account"
                                    : method.name || "UPI"}
                                </h4>
                                {method.isDefault && (
                                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {method.type === "bank"
                                  ? `•••• ${method.accountNumber?.slice(-4) || "****"}`
                                  : method.upiId}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !selectedInvestment || !selectedPayoutMethod}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="w-5 h-5" />
                        Submit Return Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Summary Card */}
              {selectedInv && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-amber-500" />
                    Request Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Investment</span>
                      <span className="font-medium text-gray-800">₹{selectedInv.amount.toLocaleString()}</span>
                    </div>
                    {selectedInv.expectedProfit && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expected Profit</span>
                        <span className="font-medium text-emerald-600">+₹{selectedInv.expectedProfit.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-medium text-gray-700">Total Payout</span>
                      <span className="font-bold text-amber-600 text-lg">
                        ₹{((selectedInv.amount || 0) + (selectedInv.expectedProfit || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {selectedPayout && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Payout to</p>
                      <p className="font-medium text-gray-800">
                        {selectedPayout.type === "bank"
                          ? `${selectedPayout.bankName || "Bank"} •••• ${selectedPayout.accountNumber?.slice(-4)}`
                          : selectedPayout.upiId}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info Cards */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">How it works</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Select Investment</p>
                      <p className="text-xs text-gray-500">Choose the investment you want to withdraw</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Choose Payout Method</p>
                      <p className="text-xs text-gray-500">Select where you want to receive funds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Admin Review</p>
                      <p className="text-xs text-gray-500">Request is reviewed within 2-3 days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Receive Funds</p>
                      <p className="text-xs text-gray-500">Amount credited to your account</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">Secure Transactions</p>
                  <p className="text-xs text-amber-600">
                    All payouts are processed securely and verified by our admin team.
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    to="/investor/return-history"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="text-sm text-gray-700">View Request History</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link
                    to="/investor/bank/manage"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="text-sm text-gray-700">Manage Bank Accounts</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link
                    to="/investor/upi/manage"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="text-sm text-gray-700">Manage UPI Methods</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
};

export default InvestorReturnRequest;
