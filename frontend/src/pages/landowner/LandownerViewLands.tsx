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
        const response = await fetch('http://localhost:5000/api/landowner/lands/my', {
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
      const response = await fetch(`http://localhost:5000/api/landowner/lands/${landId}`, {
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:items-between">
              <div className="flex items-center gap-4 mb-4 lg:mb-0">
                <div className="p-3 rounded-lg bg-emerald-500">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Your Land Portfolio
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage and monitor your agricultural land assets
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/lands/add')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                List New Land
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Lands', value: lands.length, icon: Database, color: 'bg-blue-500' },
              {
                label: 'Available',
                value: lands.filter((l) => l.status === 'available').length,
                icon: Cloud,
                color: 'bg-green-500',
              },
              {
                label: 'Leased',
                value: lands.filter((l) => l.status === 'leased').length,
                icon: Server,
                color: 'bg-purple-500',
              },
              {
                label: 'Pending Review',
                value: lands.filter((l) => !l.isApproved && !l.rejectionReason).length,
                icon: Cpu,
                color: 'bg-yellow-500',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {lands.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Cloud className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No lands listed yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by listing your first land to find a tenant or crowdfunding opportunity.
              </p>
              <button
                onClick={() => navigate('/lands/add')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300"
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
                  className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-80 flex-shrink-0 relative">
                      {land.landPhotos && land.landPhotos.length > 0 ? (
                        <img src={land.landPhotos[0]} alt={land.title} className="w-full h-48 lg:h-full object-cover" />
                      ) : (
                        <div className="w-full h-48 lg:h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                          <Server className="h-12 w-12 mb-2" />
                          <span className="text-sm">No image available</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">{getApprovalStatusDisplay(land)}</div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{land.title}</h3>
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                                <span className="line-clamp-1">{land.location.address}</span>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mt-2 sm:mt-0 ${getStatusColor(
                                land.status
                              )}`}
                            >
                              <Zap className="w-3 h-3" />
                              {land.status.charAt(0).toUpperCase() + land.status.slice(1)}
                            </span>
                          </div>

                          {/* Land Details Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">Land Size</p>
                              <div className="flex items-center">
                                <LandPlot className="w-4 h-4 text-blue-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-900">{land.sizeInAcres} acres</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">Monthly Price</p>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{land.leasePricePerMonth.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">Lease Duration</p>
                              <p className="text-sm font-semibold text-gray-900">{land.leaseDurationMonths} months</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">Soil Type</p>
                              <p className="text-sm font-semibold text-gray-900">{land.soilType}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                          <button
                            onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/landowner/lands/view/${land._id}`)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleDelete(land._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-300"
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

        {/* Replace `<style jsx>` with a plain `<style>` */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        `}</style>
      </div>
    </Layout>
  );
};

export default LandownerViewLands;
