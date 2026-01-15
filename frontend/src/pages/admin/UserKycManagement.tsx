// src/pages/admin/UserKycManagement.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Shield, User, MapPin, DollarSign, Eye, Clock, AlertCircle, Search,
  FileText, Phone, Mail, Calendar, CheckCircle2, XCircle, RefreshCw, Users, X
} from "lucide-react";
import { Layout } from "./Layout";
import { useLocation } from "react-router-dom";

interface UserKyc {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    createdAt: string;
  } | null;
  documentType: string;
  documentImage: string;
  extractedNumber: string;
  extractedText?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: { name: string; email: string } | null;
  createdAt: string;
}

interface Stats {
  byStatus: { Pending: number; Verified: number; Rejected: number };
  byRole: { landowner: number; farmer: number; investor: number };
  total: number;
}

const UserKycManagement: React.FC = () => {
  const [kycRequests, setKycRequests] = useState<UserKyc[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedKyc, setSelectedKyc] = useState<UserKyc | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const location = useLocation();

  const token = localStorage.getItem("token");

  const getAxios = () => {
    if (!token) throw new Error("No authentication token found");
    return axios.create({
      baseURL: "http://localhost:5000",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchKycRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { status: statusFilter, role: roleFilter, search: searchTerm };
      const { data } = await getAxios().get("/api/admin/user-kyc/all", { params });
      setKycRequests(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch KYC requests");
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { data } = await getAxios().get("/api/admin/user-kyc/stats");
      setStats(data.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  useEffect(() => {
    // Set role filter based on URL path
    if (location.pathname.includes('farmers')) setRoleFilter('farmer');
    else if (location.pathname.includes('landowners')) setRoleFilter('landowner');
    else if (location.pathname.includes('investors')) setRoleFilter('investor');
    else setRoleFilter('all');
  }, [location.pathname]);

  useEffect(() => {
    fetchKycRequests();
    fetchStats();
  }, [statusFilter, roleFilter]);

  const handleApprove = async (kycId: string) => {
    if (!window.confirm("Approve this KYC request?")) return;
    setActionLoading(kycId);
    try {
      await getAxios().patch(`/api/admin/user-kyc/${kycId}/approve`);
      await fetchKycRequests();
      await fetchStats();
      alert("KYC approved successfully!");
    } catch (err: any) {
      alert("Failed to approve: " + (err.response?.data?.error || err.message));
    }
    setActionLoading(null);
  };

  const handleReject = async (kycId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    setActionLoading(kycId);
    try {
      await getAxios().patch(`/api/admin/user-kyc/${kycId}/reject`, { reason });
      await fetchKycRequests();
      await fetchStats();
      alert("KYC rejected successfully!");
    } catch (err: any) {
      alert("Failed to reject: " + (err.response?.data?.error || err.message));
    }
    setActionLoading(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer': return Users;
      case 'landowner': return MapPin;
      case 'investor': return DollarSign;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-500';
      case 'landowner': return 'bg-blue-500';
      case 'investor': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getPageTitle = () => {
    if (location.pathname.includes('farmers')) return 'Farmer KYC Management';
    if (location.pathname.includes('landowners')) return 'Landowner KYC Management';
    if (location.pathname.includes('investors')) return 'Investor KYC Management';
    return 'User KYC Management';
  };

  if (!token) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center border">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
            <p className="text-gray-600">Admin authentication required.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{getPageTitle()}</h1>
                <p className="text-gray-600">Review and manage user KYC verification requests</p>
              </div>
            </div>
            <button onClick={() => { fetchKycRequests(); fetchStats(); }} disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border transition-all">
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'bg-blue-500', icon: FileText },
              { label: 'Pending', value: stats.byStatus.Pending, color: 'bg-yellow-500', icon: Clock },
              { label: 'Verified', value: stats.byStatus.Verified, color: 'bg-green-500', icon: CheckCircle2 },
              { label: 'Rejected', value: stats.byStatus.Rejected, color: 'bg-red-500', icon: XCircle },
              { label: 'Farmers', value: stats.byRole.farmer, color: 'bg-emerald-600', icon: Users },
              { label: 'Landowners', value: stats.byRole.landowner, color: 'bg-blue-600', icon: MapPin },
              { label: 'Investors', value: stats.byRole.investor, color: 'bg-purple-600', icon: DollarSign },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-8 border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by name, email, document number..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchKycRequests()}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:border-emerald-500">
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
            {!location.pathname.includes('farmers') && !location.pathname.includes('landowners') && !location.pathname.includes('investors') && (
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:border-emerald-500">
                <option value="all">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="landowner">Landowners</option>
                <option value="investor">Investors</option>
              </select>
            )}
          </div>
        </div>

        {/* KYC List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-16 text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Loading KYC Requests</h3>
            <p className="text-gray-600">Fetching verification data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-16 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h3>
            <p className="text-gray-700 mb-6">{error}</p>
            <button onClick={fetchKycRequests} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600">
              Try Again
            </button>
          </div>
        ) : kycRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-16 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No KYC Requests Found</h3>
            <p className="text-gray-600">No KYC requests match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {kycRequests.map((kyc) => {
              const RoleIcon = getRoleIcon(kyc.userId?.role || '');
              const isActionLoading = actionLoading === kyc._id;
              
              return (
                <div key={kyc._id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 ${getRoleColor(kyc.userId?.role || '')} rounded-xl flex items-center justify-center shadow`}>
                        <RoleIcon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{kyc.userId?.name || 'Unknown User'}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(kyc.status)}`}>
                            {kyc.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 uppercase">
                            {kyc.userId?.role || 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-blue-500" /> {kyc.userId?.email || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-green-500" /> {kyc.userId?.phone || 'N/A'}</span>
                          <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-purple-500" /> {kyc.documentType}: {kyc.extractedNumber}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-orange-500" /> {formatDate(kyc.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedKyc(kyc); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      {kyc.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(kyc._id)} disabled={isActionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50">
                            <CheckCircle2 className="w-4 h-4" /> {isActionLoading ? '...' : 'Approve'}
                          </button>
                          <button onClick={() => handleReject(kyc._id)} disabled={isActionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* KYC Details Modal */}
        {showModal && selectedKyc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-emerald-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Shield className="w-8 h-8 text-white" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedKyc.userId?.name || 'Unknown User'}</h2>
                    <p className="text-emerald-100">KYC Verification Details</p>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setSelectedKyc(null); }}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Info */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" /> User Information
                    </h3>
                    <div className="space-y-3">
                      <div><span className="text-sm text-blue-600 font-semibold">Name</span><p className="text-gray-900 font-medium">{selectedKyc.userId?.name || 'N/A'}</p></div>
                      <div><span className="text-sm text-blue-600 font-semibold">Email</span><p className="text-gray-900 font-medium">{selectedKyc.userId?.email || 'N/A'}</p></div>
                      <div><span className="text-sm text-blue-600 font-semibold">Phone</span><p className="text-gray-900 font-medium">{selectedKyc.userId?.phone || 'N/A'}</p></div>
                      <div><span className="text-sm text-blue-600 font-semibold">Role</span><p className="text-gray-900 font-medium capitalize">{selectedKyc.userId?.role || 'N/A'}</p></div>
                      <div><span className="text-sm text-blue-600 font-semibold">Registered</span><p className="text-gray-900 font-medium">{selectedKyc.userId?.createdAt ? formatDate(selectedKyc.userId.createdAt) : 'N/A'}</p></div>
                    </div>
                  </div>

                  {/* Document Info */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" /> Document Information
                    </h3>
                    <div className="space-y-3">
                      <div><span className="text-sm text-green-600 font-semibold">Document Type</span><p className="text-gray-900 font-medium">{selectedKyc.documentType}</p></div>
                      <div><span className="text-sm text-green-600 font-semibold">Document Number</span><p className="text-gray-900 font-medium font-mono">{selectedKyc.extractedNumber}</p></div>
                      <div><span className="text-sm text-green-600 font-semibold">Submitted At</span><p className="text-gray-900 font-medium">{formatDate(selectedKyc.createdAt)}</p></div>
                      <div><span className="text-sm text-green-600 font-semibold">Status</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusBadge(selectedKyc.status)}`}>{selectedKyc.status}</span>
                      </div>
                      {selectedKyc.verifiedAt && (
                        <div><span className="text-sm text-green-600 font-semibold">Verified At</span><p className="text-gray-900 font-medium">{formatDate(selectedKyc.verifiedAt)}</p></div>
                      )}
                      {selectedKyc.rejectionReason && (
                        <div><span className="text-sm text-red-600 font-semibold">Rejection Reason</span><p className="text-red-700 font-medium">{selectedKyc.rejectionReason}</p></div>
                      )}
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6 border">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Document Preview</h3>
                    <div className="relative group">
                      <img src={selectedKyc.documentImage} alt="KYC Document"
                        className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200 bg-white" />
                      <a href={selectedKyc.documentImage} target="_blank" rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all">
                        View Full Size
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedKyc.status === 'Pending' && (
                  <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                    <button onClick={() => { handleReject(selectedKyc._id); setShowModal(false); }}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all">
                      <XCircle className="w-5 h-5" /> Reject KYC
                    </button>
                    <button onClick={() => { handleApprove(selectedKyc._id); setShowModal(false); }}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all">
                      <CheckCircle2 className="w-5 h-5" /> Approve KYC
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserKycManagement;
