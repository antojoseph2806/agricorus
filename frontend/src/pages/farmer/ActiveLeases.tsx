import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon
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
        name: "AgriCorus",
        description: `Lease Deployment Payment`,
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
        theme: { color: "#ff3b3b" },
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
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-gray-900 text-xl font-semibold mb-2">Loading Leases</h3>
          <p className="text-gray-600">Fetching your active leases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-4">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Leases</h1>
              <div className="w-16 h-1 bg-emerald-500 rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            Manage your current land leases, process payments, and handle any issues
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
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <div className="text-4xl">🏞️</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Leases</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              You don't have any active leases at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col"
              >
                {/* Image Section */}
                <div className="w-full h-48 relative flex-shrink-0">
                  {lease.land?.landPhotos?.length ? (
                    <img
                      src={lease.land.landPhotos[0]}
                      alt={lease.land?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-t-xl">
                      <PhotoIcon className="h-12 w-12 mb-3" />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center border border-green-200">
                    <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                    ACTIVE
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {lease.land?.title || "Untitled Lease"}
                      </h2>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {lease.land?.location?.address || "No address provided"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Size</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.land?.sizeInAcres || "N/A"} acres
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.land?.soilType || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.durationMonths} months
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-500 mb-1">Price</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{lease.pricePerMonth}/month
                          </p>
                        </div>
                      </div>

                      {/* Payment Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span className="font-semibold">Payment Progress</span>
                          <span className="font-semibold text-gray-900">
                            {lease.paymentsMade} of {lease.totalPayments} paid
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(lease.paymentsMade! / lease.totalPayments!) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-6 border-t">
                      {lease.paymentsMade! < lease.totalPayments! ? (
                        <button
                          onClick={() => handleMakePayment(lease._id)}
                          className="w-full flex items-center justify-center px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 group/payment"
                        >
                          <BanknotesIcon className="h-5 w-5 mr-3" />
                          Pay Installment (₹{lease.pricePerMonth})
                          <ChevronRightIcon className="h-4 w-4 ml-2 group-hover/payment:translate-x-1 transition-transform duration-300" />
                        </button>
                      ) : (
                        <div className="w-full text-center py-4 bg-green-100 text-green-700 font-semibold rounded-lg border border-green-200">
                          ✅ Fully Paid
                        </div>
                      )}

                      {lease.agreementUrl && (
                        <a
                          href={lease.agreementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 border text-gray-700 font-semibold rounded-lg transition-all duration-300 group/agreement"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-3" />
                          View Agreement
                        </a>
                      )}

                      <button
                        onClick={() => handleRaiseDispute(lease._id)}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold rounded-lg transition-all duration-300 group/dispute"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-3" />
                        Raise Dispute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {leases.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white rounded-lg shadow-sm border px-6 py-3">
              <span className="text-gray-600 text-sm font-medium">
                Managing <span className="text-gray-900 font-bold">{leases.length}</span> Active Lease{leases.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowDisputeModal(false);
                resetDisputeForm();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 border border-red-200">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Report Issue</h3>
            </div>

            <div className="space-y-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 transition-all duration-300"
              >
                <option value="">Select Issue Category</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Lease Issue">Lease Issue</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 resize-none transition-all duration-300"
                rows={3}
                placeholder="Describe the issue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <textarea
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 resize-none transition-all duration-300"
                rows={2}
                placeholder="Additional details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />

              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <input
                  type="date"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 transition-all duration-300"
                  value={dateOfIncident}
                  onChange={(e) => setDateOfIncident(e.target.value)}
                />
              </div>

              <input
                type="number"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Amount involved (optional)"
                value={amountInvolved}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountInvolved(val === "" ? "" : Number(val));
                }}
              />

              <input
                type="text"
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Preferred resolution (optional)"
                value={preferredResolution}
                onChange={(e) => setPreferredResolution(e.target.value)}
              />

              <div>
                <label className="block text-sm text-gray-700 mb-2 font-semibold">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all duration-300"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  resetDisputeForm();
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={submitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveLeases;