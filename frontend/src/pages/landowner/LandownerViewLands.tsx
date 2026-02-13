import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  LandPlot,
  Eye,
  Trash2,
  MapPin,
  Edit,
  Plus,
  Cloud,
  Server,
  Database,
  Shield,
  Zap,
  Cpu,
} from 'lucide-react';
import { Layout } from './LandownerDashboard';

interface Land {
  _id: string;
  title: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  soilType: string;
  sizeInAcres: number;
  leasePricePerMonth: number;
  leaseDurationMonths: number;
  status: 'available' | 'leased' | 'inactive';
  landPhotos: string[];
  landDocuments: string[];
  isApproved: boolean;
  rejectionReason?: string | null;
}

const LandownerViewLands: React.FC = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLands = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/landowner/lands/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLands(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch lands.');
        }
      } catch (err) {
        setError('An error occurred while fetching your lands. Please check your network.');
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, [navigate]);

  const handleDelete = async (landId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this land listing? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/landowner/lands/${landId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLands((prev) => prev.filter((land) => land._id !== landId));
        alert('Land listing deleted successfully.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete land listing.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  const getApprovalStatusDisplay = (land: Land) => {
    if (land.isApproved) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Approved
        </span>
      );
    } else if (land.rejectionReason) {
      return (
        <span
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200"
          title={`Reason: ${land.rejectionReason}`}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-700 border-yellow-200">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          Pending Review
        </span>
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'leased':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium text-lg">Loading your lands...</p>
            <p className="text-gray-500 text-sm">Fetching your agricultural data</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-4xl mx-auto mt-8">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-bold text-lg">Data Access Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Gradient */}
        <div className="relative mb-8">
          {/* Background Gradient Banner */}
          <div className="h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            <div className="absolute top-6 right-8">
              <button
                onClick={() => navigate('/lands/add')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                List New Land
              </button>
            </div>
          </div>

          {/* Icon Badge */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <LandPlot className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mt-16 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Land Portfolio</h1>
          <p className="text-gray-500 mt-2">Manage and monitor your agricultural land assets</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Lands', value: lands.length, icon: Database, color: 'from-blue-400 to-blue-600' },
              {
                label: 'Available',
                value: lands.filter((l) => l.status === 'available').length,
                icon: Cloud,
                color: 'from-emerald-400 to-emerald-600',
              },
              {
                label: 'Leased',
                value: lands.filter((l) => l.status === 'leased').length,
                icon: Server,
                color: 'from-purple-400 to-purple-600',
              },
              {
                label: 'Pending Review',
                value: lands.filter((l) => !l.isApproved && !l.rejectionReason).length,
                icon: Cpu,
                color: 'from-amber-400 to-amber-600',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            ))}
        </div>

        {lands.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Cloud className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No lands listed yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Get started by listing your first land to find a tenant or crowdfunding opportunity.
            </p>
            <button
              onClick={() => navigate('/lands/add')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-5 h-5" />
              List Your First Land
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {lands.map((land) => (
              <div
                key={land._id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Image Section */}
                  <div className="lg:w-80 flex-shrink-0 relative">
                    {land.landPhotos && land.landPhotos.length > 0 ? (
                      <img src={land.landPhotos[0]} alt={land.title} className="w-full h-64 lg:h-full object-cover" />
                    ) : (
                      <div className="w-full h-64 lg:h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400">
                        <LandPlot className="h-16 w-16 mb-3" />
                        <span className="text-sm font-medium">No image available</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">{getApprovalStatusDisplay(land)}</div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(
                          land.status
                        )}`}
                      >
                        <Zap className="w-3 h-3" />
                        {land.status.charAt(0).toUpperCase() + land.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{land.title}</h3>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                            <span className="line-clamp-1">{land.location.address}</span>
                          </div>
                        </div>

                        {/* Land Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium mb-2">Land Size</p>
                            <div className="flex items-center">
                              <LandPlot className="w-5 h-5 text-blue-600 mr-2" />
                              <p className="text-lg font-bold text-blue-900">{land.sizeInAcres} acres</p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                            <p className="text-xs text-emerald-600 font-medium mb-2">Monthly Price</p>
                            <div className="flex items-center">
                              <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
                              <p className="text-lg font-bold text-emerald-900">
                                ₹{land.leasePricePerMonth.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                            <p className="text-xs text-purple-600 font-medium mb-2">Lease Duration</p>
                            <p className="text-lg font-bold text-purple-900">{land.leaseDurationMonths} months</p>
                          </div>

                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                            <p className="text-xs text-amber-600 font-medium mb-2">Soil Type</p>
                            <p className="text-lg font-bold text-amber-900">{land.soilType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => navigate(`/landowner/lands/view/${land._id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(land._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-500 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LandownerViewLands;
