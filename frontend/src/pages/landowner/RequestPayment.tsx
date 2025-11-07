// RequestPayment.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from './LandownerDashboard';

interface Lease {
  _id: string;
  land: {
    _id: string;
    title: string;
    location: { address: string };
  };
  farmer: {
    _id: string;
    name: string | null;
    email: string;
    phone: string;
  };
  durationMonths: number;
  pricePerMonth: number;
  paymentsMade: number;
  totalPayments: number;
  status: string;
  agreementUrl?: string;
}

interface PayoutMethod {
  _id: string;
  type: "upi" | "bank";
  name?: string;
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isDefault: boolean;
}

const RequestPayment: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [selectedLease, setSelectedLease] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchLeases();
    fetchPayoutMethods();
  }, []);

  const fetchLeases = async () => {
    try {
      const res = await axios.get(
        "https://agricorus.onrender.com/api/leases/owner/eligible-payments",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setLeases(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching leases");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPayoutMethods = async () => {
    try {
      const res = await axios.get("https://agricorus.onrender.com/api/payouts/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayoutMethods(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching payout methods");
    }
  };

  const handleLeaseChange = (leaseId: string) => {
    setSelectedLease(leaseId);
    const lease = leases.find((l) => l._id === leaseId);
    if (lease) {
      setAmount(lease.pricePerMonth);
    } else {
      setAmount(0);
    }
  };

  const handleRequestPayment = async () => {
    if (!selectedLease || !selectedMethod || amount <= 0) {
      alert("Please select lease and payout method");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `https://agricorus.onrender.com/api/payment-requests/request-payment/${selectedLease}`,
        { payoutMethodId: selectedMethod, amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(res.data.message);
      fetchLeases();
      setSelectedLease("");
      setSelectedMethod("");
      setAmount(0);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Error requesting payment");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (lease: Lease) => {
    return (lease.paymentsMade / lease.totalPayments) * 100;
  };

  const getDefaultPayoutMethod = () => {
    return payoutMethods.find(method => method.isDefault);
  };

  return (
    <Layout>
      <div 
        className="min-h-screen p-6"
        style={{
          background: 'linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Glowing Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 59, 59, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Header Card */}
          <div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          >
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Request Payment
            </h1>
            <p className="text-gray-300 text-lg">Request payment for your leased lands from the admin</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="xl:col-span-2">
              <div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Payment Request Details
                </h2>
                
                {/* Lease Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Select Lease Agreement</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    value={selectedLease}
                    onChange={(e) => handleLeaseChange(e.target.value)}
                  >
                    <option value="" className="bg-gray-800 text-white">Choose a lease agreement</option>
                    {leases.map((lease) => (
                      <option key={lease._id} value={lease._id} className="bg-gray-800 text-white">
                        {lease.land.title} - {lease.farmer.name || lease.farmer.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payout Method Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Payout Method</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    <option value="" className="bg-gray-800 text-white">Select payout method</option>
                    {payoutMethods.map((method) => (
                      <option key={method._id} value={method._id} className="bg-gray-800 text-white">
                        <span className="flex items-center justify-between">
                          <span>
                            {method.type.toUpperCase()} - {method.type === "upi" ? method.upiId : `${method.bankName}`}
                          </span>
                          {method.isDefault && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">Default</span>
                          )}
                        </span>
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-300 mt-2">
                    {getDefaultPayoutMethod() && !selectedMethod ? 
                      `Default method: ${getDefaultPayoutMethod()?.type.toUpperCase()} - ${getDefaultPayoutMethod()?.type === "upi" ? getDefaultPayoutMethod()?.upiId : getDefaultPayoutMethod()?.bankName}` 
                      : "Select your preferred payout method"}
                  </p>
                </div>

                {/* Amount Display */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-white uppercase tracking-wide mb-3">Payment Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={amount}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-white font-bold text-lg">₹</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">Amount is auto-calculated based on lease agreement</p>
                </div>

                {/* Submit Button */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                    loading || !selectedLease || !selectedMethod
                      ? "bg-gray-600 cursor-not-allowed opacity-50"
                      : "bg-red-500 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105"
                  }`}
                  onClick={handleRequestPayment}
                  disabled={loading || !selectedLease || !selectedMethod}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing Request...
                    </span>
                  ) : (
                    "REQUEST PAYMENT"
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Lease Information */}
            <div className="xl:col-span-1">
              <div 
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Lease Details
                </h2>
                
                {fetchLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                    <p className="text-gray-300">Loading leases...</p>
                  </div>
                ) : selectedLease ? (
                  <>
                    {leases.filter(lease => lease._id === selectedLease).map(lease => (
                      <div key={lease._id} className="space-y-6">
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">{lease.land.title}</h3>
                          <p className="text-gray-300 text-sm">{lease.land.location.address}</p>
                        </div>
                        
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-300">Farmer:</span>
                            <span className="font-semibold text-white">{lease.farmer.name || lease.farmer.email}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-300">Monthly Rent:</span>
                            <span className="font-semibold text-white">₹{lease.pricePerMonth.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-300">Duration:</span>
                            <span className="font-semibold text-white">{lease.durationMonths} months</span>
                          </div>
                        </div>

                        {/* Payment Progress Bar */}
                        <div className="pt-4">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-300">Payment Progress</span>
                            <span className="font-semibold text-white">{lease.paymentsMade}/{lease.totalPayments} paid</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-red-500/25"
                              style={{ width: `${getProgressPercentage(lease)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {lease.totalPayments - lease.paymentsMade} payments remaining
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-white/40 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-300">Select a lease to view details</p>
                  </div>
                )}
              </div>

              {/* Quick Stats Card */}
              <div 
                className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl border border-red-500/20 p-6 mt-6 backdrop-blur-lg shadow-2xl"
              >
                <h3 className="font-bold text-white uppercase tracking-wide mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Leases:</span>
                    <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-full">{leases.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Eligible for Payment:</span>
                    <span className="font-bold text-white bg-red-500/20 px-3 py-1 rounded-full">
                      {leases.filter(l => l.paymentsMade < l.totalPayments).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        
        select option {
          background: #1f2937;
          color: white;
          padding: 12px;
        }
        
        select:focus {
          box-shadow: 0 0 0 2px rgba(255, 59, 59, 0.5);
        }
      `}</style>
    </Layout>
  );
};

export default RequestPayment;