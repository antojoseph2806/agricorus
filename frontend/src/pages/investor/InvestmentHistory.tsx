import { useEffect, useState } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";
import { Wallet, TrendingUp, ShieldCheck, Lock } from "lucide-react";

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
        const token = localStorage.getItem("token"); // assuming JWT stored
        const res = await axios.get("http://localhost:5000/api/project-payments/investments/history", {
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

  if (loading) return <div>Loading...</div>;

  // 📊 Calculate totals
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + inv.amount * 0.05, 0);
  const totalPayout = totalInvested + totalProfit;

  return (
    <InvestorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">💼 Investment History</h1>

        {/* Summary Cards */}
        {investments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow-md rounded-lg p-4 border flex items-center gap-3">
              <Wallet className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-gray-500 text-sm">Total Invested</p>
                <p className="text-lg font-bold text-gray-800">₹{totalInvested.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 border flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-gray-500 text-sm">Expected Profit (5%)</p>
                <p className="text-lg font-bold text-green-600">₹{totalProfit.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 border flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-gray-500 text-sm">Total Payout</p>
                <p className="text-lg font-bold text-blue-600">₹{totalPayout.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {investments.length === 0 ? (
          <p>No investments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg shadow-sm bg-white">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Project</th>
                  <th className="px-4 py-2">Amount Invested</th>
                  <th className="px-4 py-2">Expected Profit</th>
                  <th className="px-4 py-2">Total Payout</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Payment ID</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const profit = inv.amount * 0.05;
                  const payout = inv.amount + profit;
                  return (
                    <tr key={inv._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{inv.projectId.title}</td>
                      <td className="px-4 py-2 font-semibold text-emerald-600">₹{inv.amount}</td>
                      <td className="px-4 py-2 text-green-600">₹{profit.toFixed(2)}</td>
                      <td className="px-4 py-2 text-blue-600 font-semibold">₹{payout.toFixed(2)}</td>
                      <td className="px-4 py-2 capitalize">{inv.projectId.status}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{inv.paymentId}</td>
                      <td className="px-4 py-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Trust & Security Badges */}
        {investments.length > 0 && (
          <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span>All investments are secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>Payments protected by Razorpay</span>
            </div>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
}
