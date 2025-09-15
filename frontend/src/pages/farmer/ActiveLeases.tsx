import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon
} from "@heroicons/react/24/solid";
import AlertMessage from "../../components/AlertMessage";

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
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<File[] | null>(null);
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [amountInvolved, setAmountInvolved] = useState<number | "">("");
  const [preferredResolution, setPreferredResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch leases
  useEffect(() => {
    const fetchActiveLeases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAlert({ type: "error", message: "You must be logged in." });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          "http://localhost:5000/api/farmer/leases/active",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) setLeases(data);
        else if (data.leases && Array.isArray(data.leases)) setLeases(data.leases);
        else setLeases([]);
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

  // ✅ Razorpay payment
  const handleMakePayment = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/payments/order/${leaseId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
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
        theme: { color: "#2874f0" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error", err);
      setAlert({ type: "error", message: "Payment failed. Please try again." });
    }
  };

  // ✅ Raise dispute
  const handleRaiseDispute = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    setShowDisputeModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };

  const resetDisputeForm = () => {
    setReason("");
    setCategory("");
    setDetails("");
    setAttachments(null);
    setDateOfIncident("");
    setAmountInvolved("");
    setPreferredResolution("");
    setSelectedLeaseId(null);
  };

  const submitDispute = async () => {
    if (!category) {
      setAlert({ type: "warning", message: "Please select a category." });
      return;
    }
    if (!reason.trim()) {
      setAlert({ type: "warning", message: "Please enter a reason." });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      let body: any;
      let headers: any = { Authorization: `Bearer ${token}` };

      if (attachments?.length) {
        body = new FormData();
        body.append("leaseId", selectedLeaseId || "");
        body.append("category", category);
        body.append("reason", reason);
        if (details) body.append("details", details);
        if (dateOfIncident) body.append("dateOfIncident", dateOfIncident);
        if (amountInvolved !== "") body.append("amountInvolved", String(amountInvolved));
        if (preferredResolution) body.append("preferredResolution", preferredResolution);
        attachments.forEach((file) => body.append("attachments", file));
      } else {
        body = JSON.stringify({
          leaseId: selectedLeaseId,
          category,
          reason,
          details: details || undefined,
          dateOfIncident: dateOfIncident || undefined,
          amountInvolved: amountInvolved !== "" ? amountInvolved : undefined,
          preferredResolution: preferredResolution || undefined,
        });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch("http://localhost:5000/api/disputes", {
        method: "POST",
        headers,
        body,
      });

      const data = await res.json();
      if (res.ok) {
        setAlert({ type: "success", message: "✅ Dispute raised successfully!" });
        setShowDisputeModal(false);
        resetDisputeForm();
      } else {
        setAlert({ type: "error", message: "❌ " + (data.error || "Failed to raise dispute.") });
      }
    } catch (err) {
      setAlert({ type: "error", message: "Error raising dispute." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your active leases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
            <h1 className="text-xl font-bold text-gray-800">Active Leases</h1>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            Manage your current land leases, view payment status, and download agreements
          </p>
        </div>

        {alert && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {leases.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">🏞️</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No active leases</h3>
            <p className="text-gray-500">
              You don't have any active lease agreements at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden"
              >
                <div className="flex flex-col"> {/* Changed from md:flex-row to flex-col */}
                  {/* Image Section - now always horizontal at the top */}
                  <div className="relative w-full h-48 sm:h-64 flex-shrink-0"> {/* Added sm:h-64 for larger screens */}
                    {lease.land?.landPhotos?.length ? (
                      <img
                        src={lease.land.landPhotos[0]}
                        alt={lease.land?.title}
                        className="w-full h-full object-cover" // Ensures image covers the set height and width
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                        <PhotoIcon className="h-12 w-12 mb-2" />
                        <span className="text-sm">No image available</span>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Active
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">
                          {lease.land?.title || "Untitled Land"}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                          {lease.land?.location?.address || "No address provided"}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-blue-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Size</p>
                            <p className="text-sm font-medium text-gray-800">
                              {lease.land?.sizeInAcres || "N/A"} acres
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                            <p className="text-sm font-medium text-gray-800">
                              {lease.land?.soilType || "N/A"}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-medium text-gray-800">
                              {lease.durationMonths} months
                            </p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Price</p>
                            <p className="text-sm font-medium text-gray-800">
                              ₹{lease.pricePerMonth}/month
                            </p>
                          </div>
                        </div>

                        {/* Payment Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Payment Progress</span>
                            <span className="font-medium">
                              {lease.paymentsMade} of {lease.totalPayments} paid
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${(lease.paymentsMade! / lease.totalPayments!) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        {lease.paymentsMade! < lease.totalPayments! ? (
                          <button
                            onClick={() => handleMakePayment(lease._id)}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors"
                          >
                            <span>Pay Next Installment (₹{lease.pricePerMonth})</span>
                            <ChevronRightIcon className="h-4 w-4 ml-2" />
                          </button>
                        ) : (
                          <div className="w-full text-center py-2.5 bg-green-50 text-green-800 text-sm font-medium rounded-sm border border-green-200">
                            ✅ Fully Paid
                          </div>
                        )}

                        {lease.agreementUrl && (
                          <a
                            href={lease.agreementUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-sm hover:bg-gray-200 transition-colors text-sm"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            View Lease Agreement
                          </a>
                        )}

                        <button
                          onClick={() => handleRaiseDispute(lease._id)}
                          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-red-600 text-white font-medium rounded-sm hover:bg-red-700 transition-colors text-sm"
                        >
                          Raise Dispute
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-lg w-full max-w-md p-5 relative">
            <button
              onClick={() => {
                setShowDisputeModal(false);
                resetDisputeForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-800 mb-4">Raise Dispute</h3>

            <div className="space-y-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Lease Issue">Lease Issue</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter reason for dispute..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Additional details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />

              <input
                type="date"
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateOfIncident}
                onChange={(e) => setDateOfIncident(e.target.value)}
              />

              <input
                type="number"
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Amount involved (optional)"
                value={amountInvolved}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountInvolved(val === "" ? "" : Number(val));
                }}
              />

              <input
                type="text"
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Preferred resolution (optional)"
                value={preferredResolution}
                onChange={(e) => setPreferredResolution(e.target.value)}
              />

              <div>
                <label className="block text-sm text-gray-600 mb-1">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  resetDisputeForm();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveLeases;