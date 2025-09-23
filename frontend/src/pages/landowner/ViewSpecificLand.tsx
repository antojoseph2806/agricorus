import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Calendar,
  Tractor,
  Waves,
  RouteIcon,
  Badge,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Ruler,
  FileText,
  CheckCircle,
  XCircle,
  Clock
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
        const response = await fetch(`http://localhost:5000/api/landowner/lands/${id}`, {
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading land details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  if (!land) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">🏞️</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Land not found</h3>
            <p className="text-gray-500 mb-4">The requested land could not be found.</p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const getApprovalStatusDisplay = (land: Land) => {
    if (land.isApproved) {
      return (
        <div className="flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Approved
        </div>
      );
    } else if (land.rejectionReason) {
      return (
        <div className="flex items-center bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium" title={land.rejectionReason}>
          <XCircle className="h-4 w-4 mr-1.5" />
          Rejected
        </div>
      );
    } else {
      return (
        <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4 mr-1.5" />
          Pending Approval
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Lands
            </button>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            {/* Image Section */}
            <div className="relative">
              {land.landPhotos && land.landPhotos.length > 0 ? (
                <img
                  src={land.landPhotos[0]}
                  alt="Main land photo"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="h-16 w-16 mb-2" />
                  <span className="text-sm">No photos available</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                {getApprovalStatusDisplay(land)}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Main Details */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{land.title}</h1>
                  <div className="flex items-center text-gray-600 mb-6">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    <span className="text-sm">{land.location.address}</span>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-sm">
                      <div className="flex items-center mb-2">
                        <Ruler className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Size</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{land.sizeInAcres} acres</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-sm">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Monthly Price</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">₹{land.leasePricePerMonth.toLocaleString()}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-sm">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Lease Duration</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{land.leaseDurationMonths} months</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-sm">
                      <div className="flex items-center mb-2">
                        <Tractor className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Soil Type</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">{land.soilType}</p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-4">
                    {land.waterSource && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-sm">
                        <Waves className="h-4 w-4 text-gray-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Water Source</p>
                          <p className="text-sm font-medium text-gray-800">{land.waterSource}</p>
                        </div>
                      </div>
                    )}

                    {land.accessibility && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-sm">
                        <RouteIcon className="h-4 w-4 text-gray-500 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Accessibility</p>
                          <p className="text-sm font-medium text-gray-800">{land.accessibility}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center p-3 bg-gray-50 rounded-sm">
                      <Badge className="h-4 w-4 text-gray-500 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm font-medium text-gray-800 capitalize">{land.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Documents and Actions */}
                <div className="lg:w-80 flex-shrink-0">
                  <div className="bg-gray-50 p-5 rounded-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents</h3>
                    
                    {land.landDocuments && land.landDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {land.landDocuments.map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-white rounded-sm border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-gray-700">Document {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No documents available</p>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium mb-3"
                      >
                        Edit Land Details
                      </button>
                      <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewSpecificLand;