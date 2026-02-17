import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Calendar,
  Tractor,
  Waves,
  Route as RouteIcon,
  Badge,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Ruler,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Cloud,
  Shield,
  Edit3
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
  waterSource: string;
  accessibility: string;
  sizeInAcres: number;
  leasePricePerMonth: number;
  leaseDurationMonths: number;
  status: 'available' | 'leased' | 'inactive';
  landPhotos: string[];
  landDocuments: string[];
  isApproved: boolean;
  rejectionReason?: string | null;
}

const ViewSpecificLand: React.FC = () => {
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/landowner/lands/${id}`, {
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
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-gray-900 text-xl font-bold mb-2">Loading Land Details</h3>
            <p className="text-gray-600 font-medium">Please wait while we fetch your data</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-sm">
              <div className="text-center">
                <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
                <p className="text-red-600 text-lg mb-6">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4 inline mr-2" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!land) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
              <Cloud className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Land Not Found</h3>
              <p className="text-gray-600 text-lg mb-6">The requested land could not be found in our system.</p>
              <button
                onClick={() => navigate(-1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-sm inline-flex items-center transition-all shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  const getApprovalStatusDisplay = (land: Land) => {
    if (land.isApproved) {
      return (
        <div className="bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-bold">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          Approved
        </div>
      );
    } else if (land.rejectionReason) {
      return (
        <div className="bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-full text-sm font-bold" title={land.rejectionReason}>
          <XCircle className="h-4 w-4 inline mr-2" />
          Rejected
        </div>
      );
    } else {
      return (
        <div className="bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-full text-sm font-bold">
          <Clock className="h-4 w-4 inline mr-2" />
          Pending Approval
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-700 hover:text-emerald-600 font-bold transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Lands
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Image Section */}
            <div className="relative">
              {land.landPhotos && land.landPhotos.length > 0 ? (
                <img
                  src={land.landPhotos[0]}
                  alt="Main land photo"
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <Server className="h-20 w-20 mb-4" />
                  <span className="text-lg font-medium">NO IMAGES AVAILABLE</span>
                </div>
              )}
              <div className="absolute top-6 right-6">
                {getApprovalStatusDisplay(land)}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 bg-gray-50">
              {/* Title and Location */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{land.title}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                  <span className="text-lg">{land.location.address}</span>
                </div>
              </div>

              {/* Key Metrics - Prominent Display */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <Ruler className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-sm text-emerald-700 font-semibold mb-1">SIZE</p>
                  <p className="text-3xl font-bold text-emerald-900">{land.sizeInAcres}</p>
                  <p className="text-sm text-emerald-700 font-medium">ACRES</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-700 font-semibold mb-1">MONTHLY PRICE</p>
                  <p className="text-3xl font-bold text-blue-900">₹{land.leasePricePerMonth.toLocaleString()}</p>
                  <p className="text-sm text-blue-700 font-medium">PER MONTH</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-purple-700 font-semibold mb-1">LEASE DURATION</p>
                  <p className="text-3xl font-bold text-purple-900">{land.leaseDurationMonths}</p>
                  <p className="text-sm text-purple-700 font-medium">MONTHS</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-2 border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <Tractor className="h-8 w-8 text-amber-600" />
                  </div>
                  <p className="text-sm text-amber-700 font-semibold mb-1">SOIL TYPE</p>
                  <p className="text-2xl font-bold text-amber-900">{land.soilType}</p>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {land.waterSource && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="bg-cyan-100 p-3 rounded-lg mr-4">
                        <Waves className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Water Source</p>
                        <p className="text-lg font-bold text-gray-900">{land.waterSource}</p>
                      </div>
                    </div>
                  </div>
                )}

                {land.accessibility && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                        <RouteIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Accessibility</p>
                        <p className="text-lg font-bold text-gray-900">{land.accessibility}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="bg-gray-100 p-3 rounded-lg mr-4">
                      <Badge className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Land Status</p>
                      <p className="text-lg font-bold text-gray-900 uppercase">{land.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-emerald-600" />
                  Land Documents
                </h3>
                
                {land.landDocuments && land.landDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {land.landDocuments.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 group"
                      >
                        <div className="bg-red-100 p-3 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Document {index + 1}</p>
                          <p className="text-xs text-gray-500">Click to view</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No documents available</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                  className="flex-1 flex items-center justify-center py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-200 shadow-sm"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Land Details
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 flex items-center justify-center py-4 px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewSpecificLand;