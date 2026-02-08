import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { InvestorLayout } from "./InvestorLayout";
import { 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  PiggyBank,
  Calendar,
  ExternalLink,
  CheckCircle,
  Clock,
  Loader2,
  Receipt,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from "lucide-react";

interface Project {
  _id: string;
  title: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
}

interface Investment {
  _id: string;
  projectId: Project;
  amount: number;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvestmentHistory() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://agricorus.onrender.com/api/project-payments/investments/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvestments(res.data.investments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </InvestorLayout>
    );
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + inv.amount * 0.05, 0);
  const totalPayout = totalInvested + totalProfit;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-emerald-100 text-emerald-700";
      case "funded": return "bg-blue-100 text-blue-700";
      case "closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <InvestorLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> Investment History
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Track all your agricultural investments</p>
          </div>
          <Link to="/projects" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-emerald-600 transition-all">
            <Sparkles className="w-4 h-4" /> New Investment
          </Link>
        </div>

        {/* Summary Cards */}
        {investments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium">Principal</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Invested</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(totalInvested)}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">5% Returns</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Expected Profit</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">Total</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 mb-1">Total Payout</p>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalPayout)}</p>
            </div>
          </div>
        )}

        {/* Investments List */}
        {investments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Investments Yet</h3>
            <p className="text-gray-500 mb-6">Start investing in agricultural projects to see your history here</p>
            <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all">
              Browse Projects <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Invested</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Payout</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {investments.map((inv) => {
                    const profit = inv.amount * 0.05;
                    const payout = inv.amount + profit;
                    return (
                      <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-lg">
                              🌿
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{inv.projectId.title}</p>
                              <p className="text-xs text-gray-400 font-mono">{inv.paymentId.slice(0, 16)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold text-gray-800">{formatCurrency(inv.amount)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold text-green-600">+{formatCurrency(profit)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-emerald-600">{formatCurrency(payout)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(inv.projectId.status)}`}>
                            {inv.projectId.status === "open" ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {inv.projectId.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/projects/${inv.projectId._id}`} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {investments.map((inv) => {
                const profit = inv.amount * 0.05;
                const payout = inv.amount + profit;
                return (
                  <div key={inv._id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">🌿</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-sm truncate">{inv.projectId.title}</p>
                          <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ml-2 ${getStatusColor(inv.projectId.status)}`}>
                        {inv.projectId.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Invested</p>
                        <p className="font-semibold text-gray-800 text-sm">{formatCurrency(inv.amount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Profit</p>
                        <p className="font-semibold text-green-600 text-sm">+{formatCurrency(profit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Payout</p>
                        <p className="font-bold text-emerald-600 text-sm">{formatCurrency(payout)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {investments.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                <span>Secure Investments</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span>Razorpay Protected</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span>5% Guaranteed Returns</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}
