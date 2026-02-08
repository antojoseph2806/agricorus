import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, Search,
  User, Mail, Calendar, DollarSign, FileText, Clock, Shield
} from "lucide-react";
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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const token = localStorage.getItem("token");

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
      setShowDetailsModal(false);
      setSelectedDispute(null);
      fetchDisputes();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredDisputes = disputes.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    return (
      d.raisedBy.name.toLowerCase().includes(searchLower) ||
      d.against.name.toLowerCase().includes(searchLower) ||
      d.reason.toLowerCase().includes(searchLower) ||
      d.category.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    inReview: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    rejected: disputes.filter(d => d.status === 'rejected').length,
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
                <p className="text-gray-600 text-sm">Monitor and resolve platform disputes</p>
              </div>
            </div>
            <button
              onClick={fetchDisputes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Total Disputes</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Open</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">In Review</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search disputes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading disputes...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Disputes Found</h3>
            <p className="text-gray-600">
              {searchTerm ? "No disputes match your search criteria" : "No disputes have been raised yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Raised By</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Against</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDisputes.map((dispute) => (
                    <tr key={dispute._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{dispute.raisedBy.name}</div>
                        <div className="text-sm text-gray-600">{dispute.raisedBy.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{dispute.against.name}</div>
                        <div className="text-sm text-gray-600">{dispute.against.email}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <div className="truncate text-gray-900">{dispute.reason}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {dispute.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">
                        {formatCurrency(dispute.amountInvolved)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
                          {dispute.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowDetailsModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dispute Details Modal */}
        {showDetailsModal && selectedDispute && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Dispute Details</h2>
                    <p className="text-red-100 text-sm">Complete dispute information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedDispute(null);
                  }}
                  className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status and Amount */}
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm text-gray-600 mb-2 block">Status</label>
                      <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm text-gray-600 mb-2 block">Amount Involved</label>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(selectedDispute.amountInvolved)}</div>
                    </div>
                  </div>

                  {/* Raised By */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Raised By
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <p className="font-semibold text-gray-900">{selectedDispute.raisedBy.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedDispute.raisedBy.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <p className="font-semibold text-gray-900 capitalize">{selectedDispute.raisedBy.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Against */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Against
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <p className="font-semibold text-gray-900">{selectedDispute.against.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedDispute.against.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Role</label>
                        <p className="font-semibold text-gray-900 capitalize">{selectedDispute.against.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dispute Information */}
                  <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Dispute Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Category</label>
                        <p className="font-semibold text-gray-900">{selectedDispute.category}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Reason</label>
                        <p className="font-semibold text-gray-900">{selectedDispute.reason}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Details</label>
                        <p className="text-gray-900">{selectedDispute.details}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Preferred Resolution</label>
                        <p className="text-gray-900">{selectedDispute.preferredResolution}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Date of Incident</label>
                          <p className="text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(selectedDispute.dateOfIncident)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Reported On</label>
                          <p className="text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatDate(selectedDispute.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedDispute.attachments && selectedDispute.attachments.length > 0 && (
                    <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3">Attachments</h3>
                      <div className="space-y-2">
                        {selectedDispute.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            {att.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleAction(selectedDispute._id, "in_review")}
                    disabled={actionLoading === selectedDispute._id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    Mark In Review
                  </button>
                  <button
                    onClick={() => handleAction(selectedDispute._id, "resolved")}
                    disabled={actionLoading === selectedDispute._id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleAction(selectedDispute._id, "rejected")}
                    disabled={actionLoading === selectedDispute._id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDisputeDashboard;
