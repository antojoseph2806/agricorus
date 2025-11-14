import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Layout } from "./Layout";

const API_BASE = "https://agricorus.onrender.com/api/disputes/admin";

interface UserRef {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Dispute {
  _id: string;
  raisedBy: UserRef;
  against: UserRef;
  lease?: { _id: string };
  reason: string;
  details: string;
  category: string;
  amountInvolved: number;
  preferredResolution: string;
  dateOfIncident: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminRemarks?: string;
}

const AdminDisputeManager: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<string>("");

  const token = localStorage.getItem("token");

  const fetchDisputes = async (status?: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const url = status ? `${API_BASE}/all?status=${status}` : `${API_BASE}/all`;
      const res = await axios.get(url, { headers });
      setDisputes(res.data.disputes || res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "resolved" | "rejected" | "in_review") => {
    if (!remarks.trim()) {
      toast.warning("⚠️ Please enter remarks before taking action.");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_BASE}/${id}/status`,
        { status: action, resolutionNote: remarks },
        { headers }
      );
      toast.success(`✅ Dispute marked as ${action}`);
      setRemarks("");
      setSelectedDispute(null);
      fetchDisputes(statusFilter);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update dispute");
    }
  };

  useEffect(() => {
    fetchDisputes(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dispute Manager</h1>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={() => fetchDisputes(statusFilter)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Dispute Cards */}
        {loading ? (
          <div className="text-gray-500 text-center">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="text-gray-500 text-center">No disputes found.</div>
        ) : (
          <div className="grid gap-4">
            {disputes.map((d) => (
              <div
                key={d._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg text-gray-800">{d.category}</h2>
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-medium ${
                      d.status === "open"
                        ? "bg-yellow-100 text-yellow-800"
                        : d.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {d.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-gray-700 space-y-1 text-sm">
                  <p><strong>Reason:</strong> {d.reason}</p>
                  <p><strong>Details:</strong> {d.details}</p>
                  <p><strong>Raised By:</strong> {d.raisedBy.name} ({d.raisedBy.email})</p>
                  <p><strong>Against:</strong> {d.against.name} ({d.against.email})</p>
                  <p><strong>Amount:</strong> ₹{d.amountInvolved || 0}</p>
                  <p><strong>Preferred Resolution:</strong> {d.preferredResolution}</p>
                  <p className="text-gray-500"><strong>Filed on:</strong> {new Date(d.createdAt).toLocaleDateString()}</p>
                  {d.adminRemarks && <p><strong>Admin Remarks:</strong> {d.adminRemarks}</p>}
                </div>

                {d.status === "open" && (
                  <div className="mt-4 border-t pt-3">
                    {selectedDispute === d._id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter admin remarks..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleAction(d._id, "resolved")}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm transition"
                          >
                            ✅ Resolve
                          </button>
                          <button
                            onClick={() => handleAction(d._id, "rejected")}
                            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm transition"
                          >
                            ❌ Reject
                          </button>
                          <button
                            onClick={() => handleAction(d._id, "in_review")}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm transition"
                          >
                            🔄 In Review
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDispute(null);
                              setRemarks("");
                            }}
                            className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 text-sm transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedDispute(d._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition"
                      >
                        Take Action
                      </button>
                    )}
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

export default AdminDisputeManager;
