import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, LandPlot, Eye, Trash2, MapPin, Edit } from 'lucide-react';
import { Layout } from './LandownerDashboard';

// Updated interface to match the new Land Mongoose schema
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
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else if (land.rejectionReason) {
      return (
        <span
          className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
          title={`Reason: ${land.rejectionReason}`}
        >
          Rejected
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10">Loading your lands...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10 text-red-600">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Listed Lands</h1>
        <p className="text-gray-600 mb-8">
          Browse and manage all the agricultural lands you have listed on AgriCorus.
        </p>

        {lands.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <LandPlot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No lands listed yet.</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by listing your first land to find a tenant or crowdfunding opportunity.
            </p>
            <button
              onClick={() => navigate('/lands/add')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              List a New Land
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {lands.map((land) => (
              <div
                key={land._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative w-full h-56 md:w-80 md:h-auto flex-shrink-0">
                  {land.landPhotos && land.landPhotos.length > 0 ? (
                    <img
                      src={land.landPhotos[0]}
                      alt={land.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                        {land.title}
                      </h3>
                      {getApprovalStatusDisplay(land)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{land.location.address}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-700">
                      <div className="flex items-center">
                        <LandPlot className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">
                          Size: <span className="font-normal">{land.sizeInAcres} acres</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">
                          Price:{" "}
                          <span className="font-normal">₹{land.leasePricePerMonth} / month</span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">
                          Status:{" "}
                          <span className="font-normal">
                            {land.status === 'available' ? 'Available' : 'Leased'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="Edit Land"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/landowner/lands/view/${land._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(land._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Land"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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
