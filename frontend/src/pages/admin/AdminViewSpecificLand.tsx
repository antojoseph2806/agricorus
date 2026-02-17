import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Text,
  Calendar,
  Tractor,
  Waves,
  Route as RouteIcon,
  Badge,
  Loader2,
  FileText,
  User as UserIcon,
  ChevronLeft,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Layout } from './Layout';

interface Land {
  _id: string;
  title: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  soilType: string;
  waterSource: string;
  accessibility: string;
  sizeInAcres: number;
  leasePricePerMonth: number;
  leaseDurationMonths: number;
  status: 'available' | 'leased' | 'inactive';
  isApproved: boolean;
  rejectionReason?: string | null;
  landPhotos: string[];
  landDocuments: string[];
  owner: {
    _id: string;
    name: string;
    email: string;
  };
}

const AdminViewSpecificLand: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLand = async () => {
      if (!id) {
        setError("Land ID is missing.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/admin/lands/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLand(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch land details.');
        }
      } catch (err) {
        setError('An error occurred. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchLand();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading land details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-medium">{error}</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!land) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <p className="text-gray-500 text-lg">Land not found.</p>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        {/* Header Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Lands
          </button>
          
          {/* Status Banner */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{land.title}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  {land.location.address}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  land.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : land.status === 'leased'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {land.status.charAt(0).toUpperCase() + land.status.slice(1)}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                  land.isApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {land.isApproved ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Shield className="w-4 h-4 mr-1" />
                  )}
                  {land.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Land Images</h2>
                {land.landPhotos && land.landPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {land.landPhotos.map((photo, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-lg">
                        <img
                          src={photo}
                          alt={`Land Photo ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Tractor className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No images uploaded for this land.</p>
                  </div>
                )}
              </div>

              {/* Documents Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  Land Documents
                </h2>
                {land.landDocuments && land.landDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {land.landDocuments.map((doc, index) => {
                      const fixedUrl = doc.includes('.pdf') ? doc.replace('/image/upload/', '/raw/upload/') : doc;
                      const fileName = doc.split('/').pop() || `Document ${index + 1}`;

                      return (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                          onClick={() => window.open(fixedUrl, '_blank')}
                        >
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium truncate max-w-xs">
                              {fileName}
                            </span>
                          </div>
                          <span className="text-blue-600 text-sm font-medium">View</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No documents uploaded for this land.</p>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Owner Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 text-blue-600 mr-2" />
                  Owner Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{land.owner?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{land.owner?.email}</p>
                  </div>
                </div>
              </div>

              {/* Land Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Land Specifications</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <Text className="w-4 h-4 mr-2 text-blue-600" />
                      Soil Type
                    </span>
                    <span className="font-medium text-gray-900">{land.soilType}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <Text className="w-4 h-4 mr-2 text-blue-600" />
                      Size
                    </span>
                    <span className="font-medium text-gray-900">{land.sizeInAcres} acres</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      Lease Price
                    </span>
                    <span className="font-medium text-gray-900">₹{land.leasePricePerMonth}/month</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                      Lease Duration
                    </span>
                    <span className="font-medium text-gray-900">{land.leaseDurationMonths} months</span>
                  </div>
                  
                  {land.waterSource && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Waves className="w-4 h-4 mr-2 text-blue-600" />
                        Water Source
                      </span>
                      <span className="font-medium text-gray-900">{land.waterSource}</span>
                    </div>
                  )}
                  
                  {land.accessibility && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 flex items-center">
                        <RouteIcon className="w-4 h-4 mr-2 text-orange-600" />
                        Accessibility
                      </span>
                      <span className="font-medium text-gray-900">{land.accessibility}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason (if exists) */}
              {land.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    Rejection Reason
                  </h3>
                  <p className="text-red-700">{land.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Edit Details
                  </button>
                  <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    Contact Owner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminViewSpecificLand;