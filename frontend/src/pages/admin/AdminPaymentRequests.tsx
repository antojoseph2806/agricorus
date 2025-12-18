// src/pages/admin/AdminPaymentRequests.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Layout } from "./Layout";

// Types
interface PayoutMethod {
  _id: string;
  type: "upi" | "bank";
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  name?: string;
}

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface Lease {
  _id: string;
  land: string;
  durationMonths: number;
  pricePerMonth: number;
  status: string;
}

interface PaymentRequest {
  _id: string;
  lease: Lease;
  land: string;
  farmer: Farmer;
  owner: Owner;
  amount: number;
  status: "pending" | "paid" | "rejected" | "canceled";
  requestedAt: string;
  payoutMethod: PayoutMethod;
  adminNote?: string;
  reviewedAt?: string;
}

// Component
const AdminPaymentRequests: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/payment-requests/admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(data.paymentRequests || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to fetch payment requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Approve or reject request
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `http://localhost:5000/api/payment-requests/admin/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: status === "approved" ? "paid" : "rejected", reviewedAt: new Date().toISOString() } : r))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to update request");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="p-6">Loading payment requests...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lease Payment Requests</h1>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <p>No payment requests found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-4 bg-white shadow-md rounded-lg flex flex-col justify-between"
              >
                <div className="mb-3">
                  <p className="font-semibold text-gray-800">
                    Owner: {req.owner.name} ({req.owner.email})
                  </p>
                  <p className="font-semibold text-gray-800">
                    Farmer: {req.farmer.name} ({req.farmer.email})
                  </p>
                  <p className="text-gray-700">
                    Lease: {req.lease._id} | Duration: {req.lease.durationMonths} months | ₹{req.lease.pricePerMonth}/month
                  </p>
                  <p className="text-gray-700">
                    Amount Requested: <span className="font-semibold">₹{req.amount}</span>
                  </p>
                  <p className="text-gray-700">
                    Payout Method:{" "}
                    {req.payoutMethod.type === "upi"
                      ? `UPI - ${req.payoutMethod.upiId} (${req.payoutMethod.name})`
                      : `Bank - ${req.payoutMethod.bankName} | A/C: ${req.payoutMethod.accountNumber} | IFSC: ${req.payoutMethod.ifscCode}`}
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        req.status === "paid"
                          ? "text-green-600 font-semibold"
                          : req.status === "rejected"
                          ? "text-red-600 font-semibold"
                          : req.status === "pending"
                          ? "text-yellow-600 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {req.status}
                    </span>
                  </p>
                  {req.adminNote && (
                    <p className="text-gray-500 text-sm mt-1">Note: {req.adminNote}</p>
                  )}
                  {req.reviewedAt && (
                    <p className="text-gray-500 text-sm mt-1">
                      Reviewed at: {new Date(req.reviewedAt).toLocaleString()}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    Requested at: {new Date(req.requestedAt).toLocaleString()}
                  </p>
                </div>

                {req.status === "pending" && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      disabled={updatingId === req._id}
                      onClick={() => updateStatus(req._id, "approved")}
                      className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={updatingId === req._id}
                      onClick={() => updateStatus(req._id, "rejected")}
                      className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPaymentRequests;
