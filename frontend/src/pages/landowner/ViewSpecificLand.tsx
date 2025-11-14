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
  Clock,
  Server,
  Cloud,
  Shield,
  Cpu
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

  // Add custom styles for the tech/hosting theme
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    .tech-theme {
      font-family: 'Inter', sans-serif;
    }
    
    .gradient-bg {
      background: linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2a3abb 100%);
    }
    
    .card-gradient {
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      backdrop-filter: blur(10px);
    }
    
    .red-button {
      background: #ff3b3b;
      transition: all 0.3s ease-in-out;
    }
    
    .red-button:hover {
      background: #ff5252;
      box-shadow: 0 0 20px rgba(255, 59, 59, 0.4);
      transform: translateY(-2px);
    }
    
    .tech-card {
      transition: all 0.3s ease-in-out;
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .tech-card:hover {
      transform: scale(1.03);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .glow-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .status-approved {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
    }
    
    .status-pending {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
    }
    
    .status-rejected {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
    }
    
    .icon-bg {
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
    }
  `;

  if (loading) {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="tech-theme gradient-bg min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="glow-overlay"></div>
          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">LOADING LAND DETAILS</h3>
            <p className="text-gray-300 font-medium">Please wait while we fetch your data</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <style>{styles}</style>
        <div className="tech-theme gradient-bg min-h-screen p-6 relative">
          <div className="glow-overlay"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="tech-card card-gradient rounded-2xl p-8 border border-red-400/20 mb-8">
              <div className="text-center">
                <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">ERROR</h2>
                <p className="text-red-200 text-lg mb-6">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="red-button text-white font-bold py-3 px-8 rounded-full uppercase tracking-wide text-sm"
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
        <style>{styles}</style>
        <div className="tech-theme gradient-bg min-h-screen p-6 relative">
          <div className="glow-overlay"></div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="tech-card card-gradient rounded-2xl p-8 text-center border border-white/10">
              <Cloud className="h-20 w-20 text-white/40 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-4">LAND NOT FOUND</h3>
              <p className="text-gray-300 text-lg mb-6">The requested land could not be found in our system.</p>
              <button
                onClick={() => navigate(-1)}
                className="red-button text-white font-bold py-3 px-8 rounded-full uppercase tracking-wide text-sm inline-flex items-center"
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
        <div className="status-approved text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
          <CheckCircle className="h-4 w-4 inline mr-2" />
          Approved
        </div>
      );
    } else if (land.rejectionReason) {
      return (
        <div className="status-rejected text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide" title={land.rejectionReason}>
          <XCircle className="h-4 w-4 inline mr-2" />
          Rejected
        </div>
      );
    } else {
      return (
        <div className="status-pending text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
          <Clock className="h-4 w-4 inline mr-2" />
          Pending Approval
        </div>
      );
    }
  };

  return (
    <Layout>
      <style>{styles}</style>
      <div className="tech-theme gradient-bg min-h-screen p-4 relative">
        <div className="glow-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-red-400 font-bold uppercase tracking-wide transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Lands
            </button>
          </div>

          {/* Main Content */}
          <div className="tech-card card-gradient rounded-2xl border border-white/10 overflow-hidden">
            {/* Image Section */}
            <div className="relative">
              {land.landPhotos && land.landPhotos.length > 0 ? (
                <img
                  src={land.landPhotos[0]}
                  alt="Main land photo"
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-white/5 flex flex-col items-center justify-center text-white/40">
                  <Server className="h-20 w-20 mb-4" />
                  <span className="text-lg font-medium">NO IMAGES AVAILABLE</span>
                </div>
              )}
              <div className="absolute top-6 right-6">
                {getApprovalStatusDisplay(land)}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Main Details */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-4">{land.title}</h1>
                  <div className="flex items-center text-white/80 mb-8">
                    <MapPin className="h-5 w-5 mr-3 text-red-400" />
                    <span className="text-lg font-medium">{land.location.address}</span>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="tech-card card-gradient p-6 rounded-xl border border-white/5">
                      <div className="flex items-center mb-4">
                        <div className="icon-bg p-3 rounded-lg mr-4">
                          <Ruler className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm font-bold uppercase tracking-wide">SIZE</p>
                          <p className="text-2xl font-bold text-white">{land.sizeInAcres} ACRES</p>
                        </div>
                      </div>
                    </div>

                    <div className="tech-card card-gradient p-6 rounded-xl border border-white/5">
                      <div className="flex items-center mb-4">
                        <div className="icon-bg p-3 rounded-lg mr-4">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm font-bold uppercase tracking-wide">MONTHLY PRICE</p>
                          <p className="text-2xl font-bold text-white">₹{land.leasePricePerMonth.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="tech-card card-gradient p-6 rounded-xl border border-white/5">
                      <div className="flex items-center mb-4">
                        <div className="icon-bg p-3 rounded-lg mr-4">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm font-bold uppercase tracking-wide">LEASE DURATION</p>
                          <p className="text-2xl font-bold text-white">{land.leaseDurationMonths} MONTHS</p>
                        </div>
                      </div>
                    </div>

                    <div className="tech-card card-gradient p-6 rounded-xl border border-white/5">
                      <div className="flex items-center mb-4">
                        <div className="icon-bg p-3 rounded-lg mr-4">
                          <Cpu className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-sm font-bold uppercase tracking-wide">SOIL TYPE</p>
                          <p className="text-2xl font-bold text-white">{land.soilType}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-4">
                    {land.waterSource && (
                      <div className="tech-card card-gradient p-4 rounded-xl border border-white/5 flex items-center">
                        <div className="icon-bg p-3 rounded-lg mr-4">
                          <Waves className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-wide">WATER SOURCE</p>
                          <p className="text-lg font-semibold text-white">{land.waterSource}</p>
                        </div>
                      </div>
                    )}

                    {land.accessibility && (
                      <div className="tech-card card-gradient p-4 rounded-xl border border-white/5 flex items-center">
                        <div className="icon-bg p-3 rounded-lg mr-4">
                          <RouteIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-wide">ACCESSIBILITY</p>
                          <p className="text-lg font-semibold text-white">{land.accessibility}</p>
                        </div>
                      </div>
                    )}

                    <div className="tech-card card-gradient p-4 rounded-xl border border-white/5 flex items-center">
                      <div className="icon-bg p-3 rounded-lg mr-4">
                        <Badge className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wide">STATUS</p>
                        <p className="text-lg font-semibold text-white uppercase">{land.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Documents and Actions */}
                <div className="lg:w-96 flex-shrink-0">
                  <div className="tech-card card-gradient p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6">DOCUMENTS</h3>
                    
                    {land.landDocuments && land.landDocuments.length > 0 ? (
                      <div className="space-y-4">
                        {land.landDocuments.map((doc, index) => (
                          <a
                            key={index}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tech-card card-gradient p-4 rounded-xl border border-white/5 hover:border-red-400/30 transition-all duration-300 flex items-center"
                          >
                            <FileText className="h-5 w-5 text-red-400 mr-3" />
                            <span className="text-white font-medium">Document {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                        <p className="text-white/60 font-medium">No documents available</p>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/10">
                      <button
                        onClick={() => navigate(`/landowner/lands/edit/${land._id}`)}
                        className="red-button w-full flex items-center justify-center py-3 px-4 rounded-full text-white font-bold uppercase tracking-wide text-sm mb-4"
                      >
                        Edit Land Details
                      </button>
                      <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center py-3 px-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 font-bold uppercase tracking-wide text-sm"
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