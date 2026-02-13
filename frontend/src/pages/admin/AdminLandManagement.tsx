import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  LandPlot,
  Eye,
  AlertCircle,
  Search,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import { Layout } from './Layout';

// Define the type for a land listing with owner details
interface Land {
  _id: string;
  title: string;
  location: {
    address: string;
  };
  sizeInAcres: number;
  leasePricePerMonth: number;
  isApproved: boolean;
  rejectionReason?: string | null;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
}

interface AdminLandManagementProps {
    statusFilter: 'all' | 'pending' | 'approved' | 'rejected';
}

const AdminLandManagement: React.FC<AdminLandManagementProps> = ({ statusFilter }) => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const getEndpoint = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'https://agricorus.duckdns.org/api/admin/lands/all';
      case 'pending':
        return 'https://agricorus.duckdns.org/api/admin/lands/pending';
      case 'approved':
        return 'https://agricorus.duckdns.org/api/admin/lands/approved';
      case 'rejected':
        return 'https://agricorus.duckdns.org/api/admin/lands/rejected';
      default:
        return 'https://agricorus.duckdns.org/api/admin/lands/all';
    }
  };

  const getTitle = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'All Land Listings';
      case 'pending':
        return 'Pending Approvals';
      case 'approved':
        return 'Approved Listings';
      case 'rejected':
        return 'Rejected Listings';
      default:
        return 'Manage Land Listings';
    }
  };

  const getStats = () => {
    const total = lands.length;
    const approved = lands.filter(land => land.isApproved).length;
    const pending = lands.filter(land => !land.isApproved && !land.rejectionReason).length;
    const rejected = lands.filter(land => land.rejectionReason).length;

    return { total, approved, pending, rejected };
  };

  const fetchLands = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const endpoint = getEndpoint(statusFilter);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLands(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch lands.');
      }
    } catch (err) {
      setError('An error occurred while fetching lands. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [navigate, statusFilter]);

  const filteredLands = lands.filter(land =>
    land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (landId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        navigate('/login');
        return;
    }
    try {
      const response = await fetch(`https://agricorus.duckdns.org/api/admin/lands/approve/${landId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Land approved successfully!');
        fetchLands();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to approve land.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleReject = async (landId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) {
      alert("Rejection cancelled or no reason provided.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        navigate('/login');
        return;
    }
    try {
      const response = await fetch(`https://agricorus.duckdns.org/api/admin/lands/reject/${landId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (response.ok) {
        alert('Land rejected successfully!');
        fetchLands();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to reject land.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };
  
  const handleUnapprove = async (landId: string) => {
    const confirmUnapprove = window.confirm("Are you sure you want to unapprove this land and set its status to pending?");
    if (!confirmUnapprove) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        navigate('/login');
        return;
    }
    try {
      const response = await fetch(`https://agricorus.duckdns.org/api/admin/lands/unapprove/${landId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Land status set to pending!');
        fetchLands();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to set land status to pending.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (landId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this land listing? This action cannot be undone.");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        navigate('/login');
        return;
    }
    try {
      const response = await fetch(`https://agricorus.duckdns.org/api/admin/lands/${landId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Land listing deleted successfully.');
        setLands(prevLands => prevLands.filter(land => land._id !== landId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete land listing.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  const getStatusBadge = (land: Land) => {
    if (land.isApproved) {
      return (
        <span className="px-2 sm:px-3 py-1 inline-flex text-xs sm:text-sm font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Approved
        </span>
      );
    } else if (land.rejectionReason) {
      return (
        <span className="px-2 sm:px-3 py-1 inline-flex text-xs sm:text-sm font-medium rounded-full bg-red-100 text-red-800 border border-red-200" title={land.rejectionReason}>
          <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-2 sm:px-3 py-1 inline-flex text-xs sm:text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600 font-medium text-sm sm:text-base">Loading land listings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="text-red-500 text-center">
              <XCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
              <p className="text-base sm:text-lg font-semibold mb-4">{error}</p>
              <button 
                onClick={fetchLands}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = getStats();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6 lg:p-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 text-white">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold">{getTitle(statusFilter)}</h1>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
              <div className="text-xs sm:text-sm opacity-90 mt-0.5">Total Listings</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-lg sm:text-2xl font-bold">{stats.pending}</div>
              <div className="text-xs sm:text-sm opacity-90 mt-0.5">Pending</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-lg sm:text-2xl font-bold">{stats.approved}</div>
              <div className="text-xs sm:text-sm opacity-90 mt-0.5">Approved</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 sm:p-4 text-center backdrop-blur-sm">
              <div className="text-lg sm:text-2xl font-bold">{stats.rejected}</div>
              <div className="text-xs sm:text-sm opacity-90 mt-0.5">Rejected</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, owner, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg text-xs sm:text-sm inline-block">
                {filteredLands.length} results
              </span>
            </div>
          </div>
        </div>

        {/* Lands Grid */}
        {filteredLands.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
            <LandPlot className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No land listings found</h3>
            <p className="text-sm text-gray-600 mb-4">Try adjusting your search criteria or check back later.</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-6">
            {filteredLands.map((land) => (
              <div key={land._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                {/* Land Header */}
                <div className="border-b border-gray-200 p-3 sm:p-6">
                  <div className="flex justify-between items-start gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 sm:line-clamp-1">{land.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {getStatusBadge(land)}
                        <span className="text-xs text-gray-500">
                          Listed {land.createdAt ? new Date(land.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Land Details */}
                <div className="p-3 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Owner Info */}
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Owner</p>
                        <p className="font-medium text-sm text-gray-900 truncate">{land.owner?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 truncate">{land.owner?.email}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="font-medium text-sm text-gray-900 line-clamp-2">{land.location?.address || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Size */}
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                        <LandPlot className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Size</p>
                        <p className="font-medium text-sm text-gray-900">{land.sizeInAcres} acres</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-600">Monthly Lease</p>
                        <p className="font-medium text-sm text-gray-900">₹{land.leasePricePerMonth.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/admin/lands/${land._id}`)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      View Details
                    </button>
                    
                    {land.isApproved ? (
                      <button
                        onClick={() => handleUnapprove(land._id)}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm"
                      >
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                        Set to Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(land._id)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                        Approve
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleReject(land._id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm"
                    >
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleDelete(land._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {filteredLands.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-gray-600">
              <span className="text-center sm:text-left">Showing {filteredLands.length} of {lands.length} listings</span>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1.5 sm:mr-2"></span>
                  Approved: {stats.approved}
                </span>
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-1.5 sm:mr-2"></span>
                  Pending: {stats.pending}
                </span>
                <span className="flex items-center">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-1.5 sm:mr-2"></span>
                  Rejected: {stats.rejected}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminLandManagement;