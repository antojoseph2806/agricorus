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
      <div 
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">LOADING DEPLOYMENTS</h3>
          <p className="text-gray-300 font-light">Initializing active lease deployments</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] p-4 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8 shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">ACTIVE DEPLOYMENTS</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-gray-300 text-lg font-light max-w-2xl leading-relaxed">
            Manage your current land deployments, process payments, and handle service issues
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <div className="text-4xl">🏞️</div>
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-3">NO ACTIVE DEPLOYMENTS</h3>
            <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
              You don't have any active lease deployments at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col shadow-lg"
              >
                {/* Image Section */}
                <div className="w-full h-48 relative flex-shrink-0">
                  {lease.land?.landPhotos?.length ? (
                    <img
                      src={lease.land.landPhotos[0]}
                      alt={lease.land?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex flex-col items-center justify-center text-gray-400">
                      <PhotoIcon className="h-12 w-12 mb-3 text-white/40" />
                      <span className="text-white/60 text-sm">No image available</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm text-green-400 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full flex items-center border border-green-400/30">
                    <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                    ACTIVE
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-3 line-clamp-2">
                        {lease.land?.title || "Untitled Deployment"}
                      </h2>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {lease.land?.location?.address || "No address provided"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Size</p>
                          <p className="text-sm font-bold text-white">
                            {lease.land?.sizeInAcres || "N/A"} acres
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Soil Type</p>
                          <p className="text-sm font-bold text-white">
                            {lease.land?.soilType || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Duration</p>
                          <p className="text-sm font-bold text-white">
                            {lease.durationMonths} months
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Price</p>
                          <p className="text-sm font-bold text-white">
                            ₹{lease.pricePerMonth}/month
                          </p>
                        </div>
                      </div>

                      {/* Payment Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span className="font-bold uppercase tracking-wide">Payment Progress</span>
                          <span className="font-bold text-white">
                            {lease.paymentsMade} of {lease.totalPayments} paid
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(lease.paymentsMade! / lease.totalPayments!) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-6 border-t border-white/10">
                      {lease.paymentsMade! < lease.totalPayments! ? (
                        <button
                          onClick={() => handleMakePayment(lease._id)}
                          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#ff3b3b]/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 border border-[#ff3b3b]/20 group/payment"
                        >
                          <BanknotesIcon className="h-5 w-5 mr-3 group-hover/payment:scale-110 transition-transform duration-300" />
                          PAY INSTALLMENT (₹{lease.pricePerMonth})
                          <ChevronRightIcon className="h-4 w-4 ml-2 group-hover/payment:translate-x-1 transition-transform duration-300" />
                        </button>
                      ) : (
                        <div className="w-full text-center py-4 bg-green-500/20 backdrop-blur-sm text-green-400 font-bold rounded-xl border border-green-400/30">
                          ✅ FULLY DEPLOYED
                        </div>
                      )}

                      {lease.agreementUrl && (
                        <a
                          href={lease.agreementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 group/agreement"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-3 group-hover/agreement:scale-110 transition-transform duration-300" />
                          VIEW AGREEMENT
                        </a>
                      )}

                      <button
                        onClick={() => handleRaiseDispute(lease._id)}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 group/dispute"
                      >
                        <ExclamationTriangleIcon className="h-4 w-4 mr-3 group-hover/dispute:scale-110 transition-transform duration-300" />
                        RAISE DISPUTE
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
            <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
              <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                Managing <span className="text-white">{leases.length}</span> Active Deployment{leases.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0a1a55] to-[#1a2a88] rounded-2xl border border-white/20 shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowDisputeModal(false);
                resetDisputeForm();
              }}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors duration-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-3 border border-red-400/30">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">REPORT ISSUE</h3>
            </div>

            <div className="space-y-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 transition-all duration-300"
              >
                <option value="" className="bg-[#1a2a88]">Select Issue Category</option>
                <option value="Payment Issue" className="bg-[#1a2a88]">Payment Issue</option>
                <option value="Lease Issue" className="bg-[#1a2a88]">Service Issue</option>
                <option value="Other" className="bg-[#1a2a88]">Other</option>
              </select>

              <textarea
                className="w-full p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 resize-none transition-all duration-300"
                rows={3}
                placeholder="Describe the issue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <textarea
                className="w-full p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 resize-none transition-all duration-300"
                rows={2}
                placeholder="Additional details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />

              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-[#ff3b3b] flex-shrink-0" />
                <input
                  type="date"
                  className="w-full p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white transition-all duration-300"
                  value={dateOfIncident}
                  onChange={(e) => setDateOfIncident(e.target.value)}
                />
              </div>

              <input
                type="number"
                className="w-full p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Amount involved (optional)"
                value={amountInvolved}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountInvolved(val === "" ? "" : Number(val));
                }}
              />

              <input
                type="text"
                className="w-full p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 transition-all duration-300"
                placeholder="Preferred resolution (optional)"
                value={preferredResolution}
                onChange={(e) => setPreferredResolution(e.target.value)}
              />

              <div>
                <label className="block text-sm text-gray-300 mb-2 font-bold uppercase tracking-wide">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#ff3b3b] file:text-white hover:file:bg-[#ff6b6b] transition-all duration-300"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  resetDisputeForm();
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={submitDispute}
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-xl hover:shadow-[#ff3b3b]/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-[#ff3b3b]/20"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT ISSUE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveLeases;