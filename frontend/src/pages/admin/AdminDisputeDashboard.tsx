import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, CheckCircle, XCircle, FileWarning, RefreshCw } from "lucide-react";
import { Layout } from "./Layout";

interface Dispute {
  _id: string;
  raisedBy: { name: string; email: string; role: string };
  against: { name: string; email: string; role: string };
  lease: { _id: string };
  reason: string;
  details: string;
  attachments: { url: string; name: string }[];
  dateOfIncident: string;
  amountInvolved: number;
  preferredResolution: string;
  category: string;
  status: string;
  createdAt: string;
}

const AdminDisputeDashboard: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // all by default
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  // ✅ Fetch disputes
  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://agricorus.onrender.com/api/landowner/disputes/admin/all${
          selectedStatus ? `?status=${selectedStatus}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDisputes(res.data.disputes || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to fetch disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [selectedStatus]);

  // ✅ Handle action
  const handleAction = async (disputeId: string, action: string) => {
    try {
      setActionLoading(disputeId);
      const adminRemarks = prompt("Enter admin remarks (optional):") || "";

      await axios.patch(
        `https://agricorus.onrender.com/api/landowner/disputes/admin/${disputeId}/action`,
        { action, adminRemarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Dispute ${action} successfully.`);
      fetchDisputes(); // refresh list
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Layout>
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileWarning className="text-blue-600" />
            Admin Dispute Dashboard
          </h1>

          <div className="flex gap-2">
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={fetchDisputes}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-md"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : disputes.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No disputes found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                  <th className="p-3">Raised By</th>
                  <th className="p-3">Against</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d._id} className="border-t text-sm hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{d.raisedBy.name}</p>
                        <p className="text-xs text-gray-500">{d.raisedBy.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{d.against.name}</p>
                        <p className="text-xs text-gray-500">{d.against.email}</p>
                      </div>
                    </td>
                    <td className="p-3 max-w-[200px] truncate">{d.reason}</td>
                    <td className="p-3">{d.category}</td>
                    <td className="p-3">₹{d.amountInvolved}</td>
                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          d.status === "open"
                            ? "bg-yellow-100 text-yellow-700"
                            : d.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleAction(d._id, "resolved")}
                        disabled={actionLoading === d._id}
                        className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs px-3 py-1 rounded-md"
                      >
                        <CheckCircle size={14} />
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(d._id, "rejected")}
                        disabled={actionLoading === d._id}
                        className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs px-3 py-1 rounded-md"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(d._id, "in_review")}
                        disabled={actionLoading === d._id}
                        className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1 rounded-md"
                      >
                        <FileWarning size={14} />
                        In Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default AdminDisputeDashboard;
