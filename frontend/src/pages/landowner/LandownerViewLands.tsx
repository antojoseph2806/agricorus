import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, LandPlot, Eye, Trash2, MapPin, Edit, Plus } from 'lucide-react';
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
            'Authorization': `Bearer ${token}`,
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
      "Are you sure you want to delete this land listing? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/landowner/lands/${landId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLands(lands.filter(land => land._id !== landId));
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
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
          Approved
        </span>
      );
    } else if (land.rejectionReason) {
      return (
        <span
          className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center"
          title={`Reason: ${land.rejectionReason}`}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></div>
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your lands...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Your Listed Lands</h1>
                  <p className="text-gray-600 text-sm">Manage all your agricultural land listings</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/lands/add')}
                className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                List New Land
              </button>
            </div>
          </div>

          {lands.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
              <div className="text-5xl text-gray-300 mb-4">🏞️</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No lands listed yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by listing your first land to find a tenant or crowdfunding opportunity.
              </p>
              <button
                onClick={() => navigate('/lands/add')}
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                List Your First Land
              </button>
            </div>
          ) : (
            <div className="grid gap-5">
              {lands.map((land) => (
                <div key={land._id} className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-64 flex-shrink-0">
                      {land.landPhotos && land.landPhotos.length > 0 ? (
                        <img
                          src={land.landPhotos[0]}
                          alt={land.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                          <LandPlot className="h-12 w-12 mb-2" />
                          <span className="text-sm">No image available</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">
                                {land.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <MapPin className="h-3 w-3 mr-1.5 text-gray-400" />
                                <span className="line-clamp-1">{land.location.address}</span>
                              </div>
                            </div>
                            {getApprovalStatusDisplay(land)}
                          </div>

                          {/* Land Details */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Size</p>
                              <div className="flex items-center">
                                <LandPlot className="h-3 w-3 text-blue-600 mr-2" />
                                <p className="text-sm font-medium text-gray-800">
                                  {land.sizeInAcres} acres
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Monthly Price</p>
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 text-blue-600 mr-2" />
                                <p className="text-sm font-medium text-gray-800">
                                  ₹{land.leasePricePerMonth.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Duration</p>
                              <p className="text-sm font-medium text-gray-800">
                                {land.leaseDurationMonths} months
                              </p>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <div className="flex items-center">
                                <TrendingUp className="h-3 w-3 text-blue-600 mr-2" />
                                <p className="text-sm font-medium text-gray-800 capitalize">
                                  {land.status}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Soil Type */}
                          <div className="bg-gray-50 p-3 rounded-sm mb-4">
                            <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                            <p className="text-sm font-medium text-gray-800">{land.soilType}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors text-sm font-medium"
                          >
                            <Edit className="h-4 w-4 mr-1.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/landowner/lands/view/${land._id}`)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(land._id)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="h-4 w-4 mr-1.5" />
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
      </div>
    </Layout>
  );
};

export default LandownerViewLands;