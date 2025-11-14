import React, { useEffect, useState, FormEvent } from "react";
import axios from "axios";
// Import ToastContainer and the default styles
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Don't forget to import the CSS!
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { InvestorLayout } from "./InvestorLayout";

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
  isDefault?: boolean;
}

const InvestorReturnRequest: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState("");
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------- Fetch Investments --------------------
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Please log in to view your investments.");

        const res = await axios.get(
          "http://localhost:5000/api/project-payments/investments/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const list = res.data.investments || [];
        setInvestments(list);

        if (list.length === 0) {
          toast.info("No investments found yet.");
        }
      } catch (err) {
        console.error("Error fetching investments:", err);
        toast.error("Unable to load investment history. Please try again later.");
      }
    };
    fetchInvestments();
  }, []);

  // -------------------- Fetch Payout Methods --------------------
  useEffect(() => {
    const fetchPayoutMethods = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Please log in to view payout methods.");

        const res = await axios.get("http://localhost:5000/api/payouts/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalized = (res.data || []).map((item: any) => ({
          ...item,
          type: item.type || item.methodType,
        }));

        setPayoutMethods(normalized);

        if (normalized.length === 0) {
          toast.info("No payout methods found. Please add one in your profile.");
        }
      } catch (err) {
        console.error("Error fetching payout methods:", err);
        toast.error("Failed to fetch payout methods. Please try again.");
      }
    };
    fetchPayoutMethods();
  }, []);

  // -------------------- Submit Return Request --------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedInvestment || !selectedPayoutMethod) {
      toast.warning("Please select both investment and payout method before submitting.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    const payload = {
      investmentId: selectedInvestment,
      payoutMethodId: selectedPayoutMethod,
    };

    console.log("Submitting Return Request Payload:", payload);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/investor/return-requests",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from backend:", res.data);

      toast.success(
        <>
          <div className="flex items-center">
            <CheckCircle className="text-green-500 mr-2" size={20} />
            <span>{res.data.message || "Return request submitted successfully!"}</span>
          </div>
        </>
      );

      setSelectedInvestment("");
      setSelectedPayoutMethod("");
    } catch (err: any) {
      console.error("Submission Error:", err.response?.data || err);

      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 400
          ? "Please check your inputs — you may have already requested a return for this investment."
          : "Something went wrong while submitting your request.");

      toast.error(
        <>
          <div className="flex items-center">
            <XCircle className="text-red-500 mr-2" size={20} />
            <span>{errorMessage}</span>
          </div>
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Component UI --------------------
  return (
    <InvestorLayout>
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-2xl p-6 mt-8">
      {/* ADDED: The ToastContainer component */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
        💰 Request Return from Admin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Investment Dropdown */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Choose Investment
          </label>
          <select
            value={selectedInvestment}
            onChange={(e) => setSelectedInvestment(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
          >
            <option value="">-- Select an Investment --</option>
            {investments.length > 0 ? (
              investments.map((inv) => (
                <option key={inv._id} value={inv._id}>
                  {inv.projectId?.title || "Unnamed Project"} — ₹
                  {inv.amount.toLocaleString()} ({inv.projectId.status})
                </option>
              ))
            ) : (
              <option disabled>No investments found</option>
            )}
          </select>
        </div>

        {/* Payout Method Dropdown */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            Select Payout Method
          </label>
          <select
            value={selectedPayoutMethod}
            onChange={(e) => setSelectedPayoutMethod(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400"
          >
            <option value="">-- Select a Payout Method --</option>
            {payoutMethods.length > 0 ? (
              payoutMethods.map((method) => (
                <option key={method._id} value={method._id}>
                  {method.type === "bank"
                    ? `Bank •••• ${method.accountNumber?.slice(-4) || ""}`
                    : method.type === "upi"
                    ? `UPI • ${method.upiId}`
                    : `Wallet • ${method.walletId || "N/A"}`}{" "}
                  {method.isDefault ? "(Default)" : ""}
                </option>
              ))
            ) : (
              <option disabled>No payout methods found</option>
            )}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white flex justify-center items-center transition ${
            loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Submitting...
            </>
          ) : (
            "Submit Return Request"
          )}
        </button>
      </form>
    </div>
    </InvestorLayout>
  );
};

export default InvestorReturnRequest;