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
        "https://agricorus.duckdns.org/api/leases/owner/eligible-payments",
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
      const res = await axios.get("https://agricorus.duckdns.org/api/payouts/", {
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
        `https://agricorus.duckdns.org/api/payment-requests/request-payment/${selectedLease}`,
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Request Payment
            </h1>
            <p className="text-gray-600 text-lg">Request payment for your leased lands from the admin</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Request Details
                </h2>
                
                {/* Lease Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Lease Agreement</label>
                  <select
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    value={selectedLease}
                    onChange={(e) => handleLeaseChange(e.target.value)}
                  >
                    <option value="">Choose a lease agreement</option>
                    {leases.map((lease) => (
                      <option key={lease._id} value={lease._id}>
                        {lease.land.title} - {lease.farmer.name || lease.farmer.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payout Method Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payout Method</label>
                  <select
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  >
                    <option value="">Select payout method</option>
                    {payoutMethods.map((method) => (
                      <option key={method._id} value={method._id}>
                        {method.type.toUpperCase()} - {method.type === "upi" ? method.upiId : `${method.bankName}`}
                        {method.isDefault && " (Default)"}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    {getDefaultPayoutMethod() && !selectedMethod ? 
                      `Default method: ${getDefaultPayoutMethod()?.type.toUpperCase()} - ${getDefaultPayoutMethod()?.type === "upi" ? getDefaultPayoutMethod()?.upiId : getDefaultPayoutMethod()?.bankName}` 
                      : "Select your preferred payout method"}
                  </p>
                </div>

                {/* Amount Display */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={amount}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-900 font-bold text-lg">₹</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Amount is auto-calculated based on lease agreement</p>
                </div>

                {/* Submit Button */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 shadow-sm ${
                    loading || !selectedLease || !selectedMethod
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : "bg-emerald-600 hover:bg-emerald-700"
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
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-6">
                  Lease Details
                </h2>
                
                {fetchLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                    <p className="text-gray-600">Loading leases...</p>
                  </div>
                ) : selectedLease ? (
                  <>
                    {leases.filter(lease => lease._id === selectedLease).map(lease => (
                      <div key={lease._id} className="space-y-6">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{lease.land.title}</h3>
                          <p className="text-gray-600 text-sm">{lease.land.location.address}</p>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600">Farmer:</span>
                            <span className="font-semibold text-gray-900">{lease.farmer.name || lease.farmer.email}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600">Monthly Rent:</span>
                            <span className="font-semibold text-gray-900">₹{lease.pricePerMonth.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold text-gray-900">{lease.durationMonths} months</span>
                          </div>
                        </div>

                        {/* Payment Progress Bar */}
                        <div className="pt-4">
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-600">Payment Progress</span>
                            <span className="font-semibold text-gray-900">{lease.paymentsMade}/{lease.totalPayments} paid</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${getProgressPercentage(lease)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {lease.totalPayments - lease.paymentsMade} payments remaining
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Select a lease to view details</p>
                  </div>
                )}
              </div>

              {/* Quick Stats Card */}
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 mt-6 shadow-sm">
                <h3 className="font-bold text-gray-900 uppercase tracking-wide mb-4">Payment Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Leases:</span>
                    <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-200">{leases.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Eligible for Payment:</span>
                    <span className="font-bold text-white bg-emerald-600 px-3 py-1 rounded-full">
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
        select option {
          background: #1f2937;
          color: white;
          padding: 12px;
        }
      `}</style>
    </Layout>
  );
};

export default RequestPayment;