// src/pages/admin/ReturnRequests.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Layout } from "./Layout";

// Types
interface PayoutMethod {
  _id: string;
  methodName?: string;
  accountNumber?: string;
  details?: string;
}

interface Investor {
  _id: string;
  name: string;
  email: string;
}

interface ReturnRequest {
  _id: string;
  investor: Investor;
  investmentId: string;
  payoutMethodId: PayoutMethod | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Component
const ReturnRequestsAdmin: React.FC = () => {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch all return requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://agricorus.onrender.com/api/investor/return-requests/admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(data.returnRequests || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle status update
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `https://agricorus.onrender.com/api/investor/return-requests/admin/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="p-6">Loading return requests...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Investor Return Requests</h1>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <p>No return requests found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-4 bg-white shadow-md rounded-lg flex flex-col justify-between"
              >
                <div className="mb-3">
                  <p className="font-semibold text-gray-800">
                    Investor: {req.investor.name} ({req.investor.email})
                  </p>
                  <p className="text-gray-700">
                    Payout Method:{" "}
                    {req.payoutMethodId
                      ? `${req.payoutMethodId.methodName || "Unknown"}${
                          req.payoutMethodId.accountNumber
                            ? ` - ${req.payoutMethodId.accountNumber}`
                            : ""
                        }`
                      : "No payout method"}
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        req.status === "approved"
                          ? "text-green-600 font-semibold"
                          : req.status === "rejected"
                          ? "text-red-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {req.status}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Created at: {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>
                {req.status === "pending" && (
                  <div className="flex space-x-2">
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

export default ReturnRequestsAdmin;
