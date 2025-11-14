import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Calendar,
  Sprout,
  Wallet,
  ShieldCheck,
  Lock,
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
  const [investAmount, setInvestAmount] = useState<number>(2000); // default minimum
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // ensure token exists

  useEffect(() => {
    const fetchProject = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          `https://agricorus.onrender.com/api/projects/investor/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load project. Check console for details.");
      }
    };
    fetchProject();
  }, [id, token]);

  if (!project) return <div className="p-6">Loading project details...</div>;

  const progress = (project.currentFunding / project.fundingGoal) * 100;
  const remaining = project.fundingGoal - project.currentFunding;

  const expectedReturn = investAmount * 0.05;
  const totalPayout = investAmount + expectedReturn;

  const handleInvest = async () => {
    if (!token) {
      alert("Please login first!");
      return;
    }

    // Frontend Validations
    if (investAmount < 2000) {
      alert("Minimum investment is ₹2000");
      return;
    }
    if (investAmount % 500 !== 0) {
      alert("Investment must be in multiples of ₹500");
      return;
    }
    if (investAmount > remaining) {
      alert(`Investment cannot exceed remaining funding: ₹${remaining}`);
      return;
    }

    try {
      setLoading(true);
      // Step 1: Create order on backend
      const res = await axios.post(
        "https://agricorus.onrender.com/api/project-payments/create-order",
        { amount: investAmount, projectId: project._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order } = res.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: "rzp_test_RD4okzNgjx8nbC", // replace with your key
        amount: order.amount,
        currency: order.currency,
        name: project.title,
        description: "Invest in this project",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Step 3: Verify payment
            await axios.post(
              "https://agricorus.onrender.com/api/project-payments/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                projectId: project._id,
                amount: investAmount,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Payment successful!");

            // Refresh project to update funding progress
            const updated = await axios.get(
              `https://agricorus.onrender.com/api/projects/investor/${project._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setProject(updated.data);
          } catch (err) {
            console.error(err);
            alert("Payment verification failed. Contact support.");
          }
        },
        prefill: { email: project.farmerId?.email },
        theme: { color: "#4ADE80" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initiation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvestorLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <Link
            to="/projects"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Link>
        </div>

        <div className="max-w-3xl mx-auto bg-white border rounded-2xl shadow-lg p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <span
              className={`inline-block mt-2 px-3 py-1 text-sm rounded-full capitalize ${
                project.status === "open"
                  ? "bg-green-100 text-green-700"
                  : project.status === "funded"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {project.status}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Sprout className="w-5 h-5 text-green-600" />
              <span className="font-medium">Crop:</span> {project.cropType}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Start:</span>{" "}
              {new Date(project.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-red-600" />
              <span className="font-medium">End:</span>{" "}
              {new Date(project.endDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Wallet className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Goal:</span> ₹
              {project.fundingGoal.toLocaleString()}
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-600 h-4"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-gray-700">
              ₹{project.currentFunding.toLocaleString()} raised of ₹
              {project.fundingGoal.toLocaleString()}
            </p>
          </div>

          {project.farmerId && (
            <div className="flex items-center gap-3 mt-4 text-gray-600 border-t pt-4">
              <User className="w-5 h-5" />
              <div>
                <p className="font-medium">
                  {project.farmerId.name || "Unknown Farmer"}
                </p>
                <p className="text-sm text-gray-500">
                  {project.farmerId.email}
                </p>
              </div>
            </div>
          )}

          {project.status === "open" && (
            <div className="mt-8">
              <label className="block text-gray-700 mb-2 font-medium">
                Investment Amount (₹)
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-green-500"
                value={investAmount}
                min={2000}
                step={500}
                max={remaining}
                onChange={(e) => setInvestAmount(Number(e.target.value))}
              />

              {/* Returns & Payout Card */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 shadow-sm">
                <h3 className="font-semibold text-green-700 flex items-center gap-2">
                  💹 Expected Returns
                </h3>
                <p className="mt-1 text-gray-700">
                  5% of ₹{investAmount.toLocaleString()} =
                  <span className="font-bold text-green-600">
                    {" "}
                    ₹{expectedReturn.toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-600 mt-1">
                  📈 Total Payout (Principal + Return):{" "}
                  <span className="font-bold text-blue-600">
                    ₹{totalPayout.toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Trust & Security Badges */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span>Protected by Razorpay</span>
                </div>
              </div>

              <button
                onClick={handleInvest}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 shadow-md"
              >
                {loading ? "Processing..." : "🚀 Invest in this Project"}
              </button>
            </div>
          )}
        </div>
      </div>
    </InvestorLayout>
  );
}
