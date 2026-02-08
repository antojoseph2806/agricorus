import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Calendar,
  Leaf,
  Target,
  ShieldCheck,
  Lock,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  Info,
  Loader2,
  Sparkles,
  IndianRupee,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";
import { InvestorLayout } from "./InvestorLayout";

interface Project {
  _id: string;
  title: string;
  description: string;
  cropType: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
  startDate: string;
  endDate: string;
  farmerId?: { name: string | null; email: string };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function InvestorProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(2000);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProject = async () => {
      if (!token) return;
      try {
        setPageLoading(true);
        const res = await axios.get(`https://agricorus.onrender.com/api/projects/investor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchProject();
  }, [id, token]);

  if (pageLoading) {
    return (
      <InvestorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </InvestorLayout>
    );
  }

  if (!project) {
    return (
      <InvestorLayout>
        <div className="text-center py-16">
          <p className="text-gray-500">Project not found</p>
          <Link to="/projects" className="text-emerald-600 hover:underline mt-2 inline-block">
            Back to Projects
          </Link>
        </div>
      </InvestorLayout>
    );
  }

  const progress = (project.currentFunding / project.fundingGoal) * 100;
  const remaining = project.fundingGoal - project.currentFunding;
  const expectedReturn = investAmount * 0.05;
  const totalPayout = investAmount + expectedReturn;
  const isOpen = project.status === "open";

  const getDaysRemaining = () => {
    const diff = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const handleInvest = async () => {
    if (!token) { alert("Please login first!"); return; }
    if (investAmount < 2000) { alert("Minimum investment is ₹2000"); return; }
    if (investAmount % 500 !== 0) { alert("Investment must be in multiples of ₹500"); return; }
    if (investAmount > remaining) { alert(`Investment cannot exceed remaining funding: ₹${remaining}`); return; }

    try {
      setLoading(true);
      const res = await axios.post("https://agricorus.onrender.com/api/project-payments/create-order",
        { amount: investAmount, projectId: project._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { order } = res.data;

      const options = {
        key: "rzp_test_RD4okzNgjx8nbC",
        amount: order.amount,
        currency: order.currency,
        name: project.title,
        description: "Invest in this project",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            await axios.post("https://agricorus.onrender.com/api/project-payments/verify",
              { razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature, projectId: project._id, amount: investAmount },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Payment successful!");
            const updated = await axios.get(`https://agricorus.onrender.com/api/projects/investor/${project._id}`, { headers: { Authorization: `Bearer ${token}` } });
            setProject(updated.data);
          } catch (err) {
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: { email: project.farmerId?.email },
        theme: { color: "#10B981" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [2000, 5000, 10000, 25000];

  return (
    <InvestorLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to="/projects" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className={`p-6 ${isOpen ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gray-400"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-3 ${isOpen ? "bg-white/20 text-white" : "bg-white/30 text-white"}`}>
                      {isOpen ? <Zap className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{project.title}</h1>
                  </div>
                  <span className="text-4xl">🌿</span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Crop
                    </div>
                    <p className="font-semibold text-gray-800">{project.cropType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> Start
                    </div>
                    <p className="font-semibold text-gray-800">{new Date(project.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5 text-red-500" /> End
                    </div>
                    <p className="font-semibold text-gray-800">{new Date(project.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Remaining
                    </div>
                    <p className="font-semibold text-gray-800">{getDaysRemaining()} days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Progress Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> Funding Progress
              </h3>
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(project.currentFunding)}</p>
                  <p className="text-sm text-gray-500">raised of {formatCurrency(project.fundingGoal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{progress.toFixed(0)}%</p>
                  <p className="text-sm text-gray-500">funded</p>
                </div>
              </div>
              {remaining > 0 && (
                <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <span className="font-semibold">{formatCurrency(remaining)}</span> still needed to reach the goal
                  </p>
                </div>
              )}
            </div>

            {/* Farmer Card */}
            {project.farmerId && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-500" /> Project Owner
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {project.farmerId.name?.charAt(0) || "F"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{project.farmerId.name || "Verified Farmer"}</p>
                    <p className="text-sm text-gray-500">{project.farmerId.email}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> KYC Verified
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Investment Sidebar */}
          <div className="space-y-6">
            {isOpen ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" /> Make an Investment
                </h3>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setInvestAmount(amt)}
                      className={`py-2 rounded-xl text-sm font-medium transition-all ${investAmount === amt ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Custom Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={investAmount}
                      min={2000}
                      step={500}
                      max={remaining}
                      onChange={(e) => setInvestAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-lg font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Min ₹2,000 • Multiples of ₹500</p>
                </div>

                {/* Returns Calculator */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 mb-4 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3">
                    <TrendingUp className="w-4 h-4" /> Expected Returns
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Investment</span>
                      <span className="font-semibold text-gray-800">{formatCurrency(investAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Returns (5%)</span>
                      <span className="font-semibold text-emerald-600">+ {formatCurrency(expectedReturn)}</span>
                    </div>
                    <div className="border-t border-emerald-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">Total Payout</span>
                        <span className="font-bold text-lg text-emerald-600">{formatCurrency(totalPayout)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invest Button */}
                <button
                  onClick={handleInvest}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <><PiggyBank className="w-5 h-5" /> Invest Now</>
                  )}
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-4 h-4 text-blue-500" /> Razorpay
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">Project {project.status}</p>
                <p className="text-sm text-gray-500 mt-1">This project is no longer accepting investments</p>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Investment Info</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Returns paid after harvest</li>
                    <li>• 5% guaranteed returns</li>
                    <li>• Principal protected</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
