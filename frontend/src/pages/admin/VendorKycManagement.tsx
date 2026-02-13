import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

interface KycRequest {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  kycStatus: 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  businessType: string;
  vendorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
}

interface KycStats {
  PENDING: number;
  SUBMITTED: number;
  VERIFIED: number;
  REJECTED: number;
  TOTAL: number;
}

const VendorKycManagement: React.FC = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [stats, setStats] = useState<KycStats>({
    PENDING: 0,
    SUBMITTED: 0,
    VERIFIED: 0,
    REJECTED: 0,
    TOTAL: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchKycRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`https://agricorus.duckdns.org/api/admin/kyc/requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setKycRequests(data.data.requests);
        setTotalPages(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://agricorus.duckdns.org/api/admin/kyc/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching KYC stats:', error);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://agricorus.duckdns.org/api/admin/kyc/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchKycRequests();
        await fetchStats();
        setShowModal(false);
        alert('KYC request approved successfully!');
      } else {
        alert(data.message || 'Failed to approve KYC request');
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
      alert('Error approving KYC request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://agricorus.duckdns.org/api/admin/kyc/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });

      const data = await response.json();
      if (data.success) {
        await fetchKycRequests();
        await fetchStats();
        setShowModal(false);
        setRejectionReason('');
        alert('KYC request rejected successfully!');
      } else {
        alert(data.message || 'Failed to reject KYC request');
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      alert('Error rejecting KYC request');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (request: KycRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setRejectionReason('');
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchKycRequests(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [currentPage, statusFilter, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'SUBMITTED':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'VERIFIED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'SUBMITTED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'VERIFIED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vendor KYC Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Review and manage vendor KYC submissions</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.TOTAL}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.PENDING}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.SUBMITTED}</p>
              </div>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.VERIFIED}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.REJECTED}</p>
              </div>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by business name, owner name, email, or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* KYC Requests Table/Cards */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-gray-200">
            {kycRequests.map((request) => (
              <div key={request._id} className="p-4 hover:bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 truncate">{request.ownerName}</div>
                    <div className="text-xs text-gray-500 truncate">{request.email}</div>
                    <div className="text-xs text-gray-500">{request.phone}</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Business Name</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{request.businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Business Type</p>
                      <p className="text-sm text-gray-900">{request.businessType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(request.kycStatus)}
                        <span className={getStatusBadge(request.kycStatus)}>
                          {request.kycStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="text-sm text-gray-900">
                        {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'Not submitted'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openModal(request)}
                    className="w-full flex items-center justify-center gap-1 text-emerald-600 hover:text-emerald-900 text-sm font-medium py-2 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kycRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.ownerName}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                        <div className="text-sm text-gray-500">{request.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.businessName}</div>
                        <div className="text-sm text-gray-500">{request.businessType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.kycStatus)}
                        <span className={getStatusBadge(request.kycStatus)}>
                          {request.kycStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'Not submitted'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(request)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-900"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for KYC Details */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">KYC Request Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Vendor Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Vendor Information</h3>
                    <div className="space-y-2 text-sm sm:text-base">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Owner Name</label>
                        <p className="text-sm text-gray-900">{selectedRequest.ownerName}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900 break-all">{selectedRequest.email}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{selectedRequest.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Business Name</label>
                        <p className="text-sm text-gray-900 break-words">{selectedRequest.businessName}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Business Type</label>
                        <p className="text-sm text-gray-900">{selectedRequest.businessType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Status Information</h3>
                    <div className="space-y-2 text-sm sm:text-base">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Current Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(selectedRequest.kycStatus)}
                          <span className={getStatusBadge(selectedRequest.kycStatus)}>
                            {selectedRequest.kycStatus}
                          </span>
                        </div>
                      </div>
                      {selectedRequest.submittedAt && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Submitted At</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedRequest.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedRequest.verifiedAt && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Verified At</label>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedRequest.verifiedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {selectedRequest.rejectionReason && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Rejection Reason</label>
                          <p className="text-sm text-red-600 break-words">{selectedRequest.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedRequest.kycStatus === 'SUBMITTED' && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Actions</h3>
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                          onClick={() => handleApprove(selectedRequest._id)}
                          disabled={actionLoading}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionLoading ? 'Processing...' : 'Approve KYC'}
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">Rejection Reason</label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                          rows={3}
                        />
                        <button
                          onClick={() => handleReject(selectedRequest._id)}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm sm:text-base"
                        >
                          <XCircle className="w-4 h-4" />
                          {actionLoading ? 'Processing...' : 'Reject KYC'}
                        </button>
                      </div>
                    </div>
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

export default VendorKycManagement;