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

const ViewLands: React.FC = () => {
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
    const confirmDelete = window.confirm("Are you sure you want to delete this land listing? This action cannot be undone.");
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
        // Remove the deleted land from the state
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
    return <Layout><div className="text-center py-10">Loading your lands...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-10 text-red-600">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Listed Lands</h1>
        <p className="text-gray-600 mb-8">Browse and manage all the agricultural lands you have listed on AgriCorus.</p>
        
        {lands.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <LandPlot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold">No lands listed yet.</h3>
            <p className="mt-1 text-sm">
              Get started by listing your first land to find a tenant or crowdfunding opportunity.
            </p>
            <button
              onClick={() => navigate('/lands/add')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              List a New Land
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.map((land) => (
              <div key={land._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                {land.landPhotos && land.landPhotos.length > 0 && (
                  <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={land.landPhotos[0]}
                      alt={land.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{land.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                     <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {land.location.address}
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center">
                      <LandPlot className="w-4 h-4 mr-2 text-emerald-500" />
                      <span>{land.sizeInAcres} acres</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                      <span>₹{land.leasePricePerMonth} / month</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                      <span>{land.status === 'available' ? 'Available' : 'Leased'}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-emerald-500" />
                      {getApprovalStatusDisplay(land)}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => navigate(`/lands/edit/${land._id}`)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                    title="Edit Land"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/lands/${land._id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(land._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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

export default ViewLands;