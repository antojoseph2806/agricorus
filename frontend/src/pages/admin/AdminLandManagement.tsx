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
  AlertCircle
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
}

interface AdminLandManagementProps {
    statusFilter: 'all' | 'pending' | 'approved' | 'rejected';
}

const AdminLandManagement: React.FC<AdminLandManagementProps> = ({ statusFilter }) => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getEndpoint = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'http://localhost:5000/api/admin/lands/all';
      case 'pending':
        return 'http://localhost:5000/api/admin/lands/pending';
      case 'approved':
        return 'http://localhost:5000/api/admin/lands/approved';
      case 'rejected':
        return 'http://localhost:5000/api/admin/lands/rejected';
      default:
        return 'http://localhost:5000/api/admin/lands/all';
    }
  };

  const getTitle = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'All Land Listings';
      case 'pending':
        return 'Pending Land Listings';
      case 'approved':
        return 'Approved Land Listings';
      case 'rejected':
        return 'Rejected Land Listings';
      default:
        return 'Manage All Land Listings';
    }
  };

  const fetchLands = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      // ✅ This check is crucial. If there's no token, redirect immediately.
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
        setError(null); // Clear any previous errors
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

  const handleApprove = async (landId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication error. Please log in again.');
        navigate('/login');
        return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/admin/lands/approve/${landId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Land approved successfully!');
        fetchLands(); // Re-fetch lands to update the list
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
      const response = await fetch(`http://localhost:5000/api/admin/lands/reject/${landId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (response.ok) {
        alert('Land rejected successfully!');
        fetchLands(); // Re-fetch lands to update the list
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
      const response = await fetch(`http://localhost:5000/api/admin/lands/unapprove/${landId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Land status set to pending!');
        fetchLands(); // Re-fetch lands to update the list
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
      const response = await fetch(`http://localhost:5000/api/admin/lands/${landId}`, {
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

  const getStatusDisplay = (land: Land) => {
    if (land.isApproved) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else if (land.rejectionReason) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" title={land.rejectionReason}>
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading lands...
        </div>
      </Layout>
    );
  }

  if (error) {
    return <Layout><div className="text-center py-10 text-red-600">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{getTitle(statusFilter)}</h1>
        <p className="text-gray-600 mb-8">Review and manage all lands uploaded by landowners. Use the actions below to approve or delete listings.</p>
        
        {lands.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold">No land listings found.</h3>
            <p className="mt-1 text-sm">There are no lands to review at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size/Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lands.map((land) => (
                  <tr key={land._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{land.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{land.owner?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{land.location?.address || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {land.sizeInAcres} acres<br/>
                      ₹{land.leasePricePerMonth} / mo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusDisplay(land)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/admin/lands/${land._id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {land.isApproved ? (
                          <button
                            onClick={() => handleUnapprove(land._id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Set to Pending"
                          >
                            <AlertCircle className="w-5 h-5" />
                          </button>
                      ) : (
                          <button
                            onClick={() => handleApprove(land._id)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Approve Land"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                      )}
                      <button
                          onClick={() => handleReject(land._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Reject Land"
                      >
                          <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(land._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Land"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminLandManagement;