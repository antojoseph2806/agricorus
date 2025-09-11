import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import AlertMessage from "../../components/AlertMessage"; // ✅ Reuse alert

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Lease {
  _id: string;
  land?: {
    title?: string;
    location?: { address?: string };
    sizeInAcres?: number;
    soilType?: string;
    waterSource?: string;
    accessibility?: string;
    leasePricePerMonth?: number;
    leaseDurationMonths?: number;
    landPhotos?: string[];
  };
  owner?: { email?: string; phone?: string };
  durationMonths: number;
  pricePerMonth: number;
  status: string;
  createdAt?: string;
  paymentsMade?: number;
  totalPayments?: number;
  agreementUrl?: string;
}

const ActiveLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Alert state
  const [alert, setAlert] = useState<
    { type: "success" | "error" | "warning"; message: string } | null
  >(null);

  // ✅ Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchActiveLeases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/farmer/leases/active",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setLeases(data);
        } else if (data.leases && Array.isArray(data.leases)) {
          setLeases(data.leases);
        } else {
          setLeases([]);
        }
      } catch (err) {
        console.error("Error fetching active leases", err);
        setAlert({
          type: "error",
          message: "Failed to load active leases. Please try again.",
        });
        setLeases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLeases();
  }, []);

  const handleMakePayment = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/payments/order/${leaseId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderData = await res.json();

      if (!orderData.orderId) {
        setAlert({ type: "error", message: "Failed to create payment order." });
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Farm Lease Payment",
        description: `Lease Installment Payment`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch(
            "http://localhost:5000/api/payments/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                leaseId,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            setAlert({ type: "success", message: "✅ Payment successful!" });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setAlert({
              type: "error",
              message: "❌ Payment verification failed: " + verifyData.error,
            });
          }
        },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error", err);
      setAlert({ type: "error", message: "Payment failed. Please try again." });
    }
  };

  const handleRaiseDispute = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    setShowDisputeModal(true);
  };

  const submitDispute = async () => {
    if (!reason.trim()) {
      setAlert({ type: "warning", message: "Please enter a reason." });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/disputes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leaseId: selectedLeaseId, reason }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({ type: "success", message: "✅ Dispute raised successfully!" });
        setShowDisputeModal(false);
        setReason("");
      } else {
        setAlert({ type: "error", message: "❌ " + data.error });
      }
    } catch (err) {
      setAlert({ type: "error", message: "Error raising dispute." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Loading active leases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 lg:p-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
        Your Active Leases
      </h1>
      <p className="text-lg text-gray-500 mb-10 max-w-2xl">
        Manage your current land leases, view payment status, and download agreements.
      </p>

      {/* ✅ Alert section */}
      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {leases.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <CheckCircleIcon className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-2xl font-semibold text-gray-500">No active leases found.</p>
          <p className="mt-2 text-md text-gray-400">Time to find a new field to cultivate!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {leases.map((lease) => (
            <div
              key={lease._id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col md:flex-row"
            >
              {/* Image Section */}
              <div className="relative w-full h-48 md:w-64 md:h-auto flex-shrink-0">
                {lease.land?.landPhotos?.length ? (
                  <img
                    src={lease.land.landPhotos[0]}
                    alt={lease.land?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium">
                    No Image Available
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-emerald-600/95 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-md">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{lease.status}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {lease.land?.title || "Untitled Land"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    <span className="font-medium text-gray-600">Location:</span>{" "}
                    {lease.land?.location?.address || "N/A"}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-gray-700 text-sm">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-600 mr-1">Size:</span>
                      <span className="text-gray-500">
                        {lease.land?.sizeInAcres || "N/A"} acres
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-600 mr-1">Soil:</span>
                      <span className="text-gray-500">
                        {lease.land?.soilType || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-600 mr-1">Water:</span>
                      <span className="text-gray-500">
                        {lease.land?.waterSource || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-600 mr-1">Duration:</span>
                      <span className="text-gray-500">
                        {lease.durationMonths} months
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Section - Payment, Agreement & Dispute */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between text-base">
                    <p className="font-semibold text-gray-700">Payment Status</p>
                    <span className="font-medium text-gray-600">
                      {lease.paymentsMade} of {lease.totalPayments} paid
                    </span>
                  </div>

                  {lease.paymentsMade! < lease.totalPayments! ? (
                    <button
                      onClick={() => handleMakePayment(lease._id)}
                      className="w-full flex justify-center items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-colors duration-200 font-semibold"
                    >
                      Pay Next Installment (₹{lease.pricePerMonth})
                      <ChevronRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  ) : (
                    <div className="w-full text-center py-3 bg-green-50 text-green-700 rounded-lg font-semibold border border-green-200">
                      ✅ Fully Paid
                    </div>
                  )}

                  {lease.agreementUrl && (
                    <a
                      href={lease.agreementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-colors duration-200 text-sm font-medium"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                      View Lease Agreement
                    </a>
                  )}

                  {/* ✅ Raise Dispute button */}
                  <button
                    onClick={() => handleRaiseDispute(lease._id)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-colors duration-200 text-sm font-semibold"
                  >
                    Raise Dispute
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowDisputeModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Raise Dispute
            </h3>
            <textarea
              className="w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Enter reason for dispute..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveLeases;
