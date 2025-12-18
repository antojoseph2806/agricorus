import { useState, useEffect } from "react";
import axios from "axios";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  User,
  FileText,
  AlertCircle
} from "lucide-react";

interface KycRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
  };
  documentType: string;
  documentImage: string;
  extractedText?: string;
  extractedNumber?: string;
  status: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const UserKycManagement = () => {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [selectedStatus, selectedRole]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (selectedRole !== "ALL") params.append("role", selectedRole);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL}/api/admin/user-kyc/requests?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRequests(response.data.data.requests);
      }
    } catch (error: any) {
      console.error("Error fetching KYC requests:", error);
      alert(error.response?.data?.message || "Failed to fetch KYC requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL}/api/admin/user-kyc/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this KYC request?")) return;

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${(import.meta as any).env.VITE_BACKEND_URL}/api/admin/user-kyc/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("KYC approved successfully!");
        fetchRequests();
        fetchStats();
        setShowModal(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to approve KYC");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${(import.meta as any).env.VITE_BACKEND_URL}/api/admin/user-kyc/reject/${id}`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("KYC rejected successfully!");
        fetchRequests();
        fetchStats();
        setShowModal(false);
        setRejectionReason("");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to reject KYC");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "Rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      farmer: "bg-blue-100 text-blue-800",
      landowner: "bg-purple-100 text-purple-800",
      investor: "bg-green-100 text-green-800"
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User KYC Management</h1>
        <p className="text-gray-600">Manage KYC verification for farmers, landowners, and investors</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total KYC</p>
                <p className="text-2xl font-bold text-gray-900">{stats.TOTAL}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.Pending.total}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.Verified.total}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.Rejected.total}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="landowner">Landowner</option>
              <option value="investor">Investor</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("ALL");
              setSelectedRole("ALL");
              fetchRequests();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No KYC Requests Found</h3>
          <p className="text-gray-600">No KYC requests match your current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{request.userId.name}</div>
                          <div className="text-sm text-gray-500">{request.userId.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(request.userId.role)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{request.documentType}</div>
                      {request.extractedNumber && (
                        <div className="text-xs text-gray-500">{request.extractedNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
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

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">KYC Request Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRejectionReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedRequest.userId.name}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedRequest.userId.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedRequest.userId.phone || "N/A"}</span></div>
                    <div><span className="text-gray-600">Role:</span> {getRoleBadge(selectedRequest.userId.role)}</div>
                    <div><span className="text-gray-600">Joined:</span> <span className="font-medium">{new Date(selectedRequest.userId.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">KYC Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Document Type:</span> <span className="font-medium">{selectedRequest.documentType}</span></div>
                    <div><span className="text-gray-600">Document Number:</span> <span className="font-medium">{selectedRequest.extractedNumber || "N/A"}</span></div>
                    <div><span className="text-gray-600">Status:</span> {getStatusBadge(selectedRequest.status)}</div>
                    <div><span className="text-gray-600">Submitted:</span> <span className="font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString()}</span></div>
                    {selectedRequest.verifiedAt && (
                      <div><span className="text-gray-600">Verified:</span> <span className="font-medium">{new Date(selectedRequest.verifiedAt).toLocaleDateString()}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Image */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Document Image</h3>
                <img
                  src={selectedRequest.documentImage}
                  alt="KYC Document"
                  className="w-full max-h-96 object-contain border rounded-lg"
                />
              </div>

              {/* Rejection Reason */}
              {selectedRequest.status === "Rejected" && selectedRequest.rejectionReason && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Rejection Reason</h4>
                      <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedRequest.status === "Pending" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedRequest._id)}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {processing ? "Processing..." : "Approve KYC"}
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      {processing ? "Processing..." : "Reject KYC"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserKycManagement;
