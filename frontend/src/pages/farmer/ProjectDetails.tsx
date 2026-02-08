// src/pages/farmer/projects/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaArrowLeft, 
  FaRupeeSign, 
  FaChartLine, 
  FaUser, 
  FaRocket, 
  FaDatabase,
  FaMapMarkerAlt,
  FaLeaf,
  FaShieldAlt,
  FaCamera,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCalendarAlt,
  FaGlobe,
  FaHome,
  FaIdCard,
  FaImage,
  FaVideo,
  FaDownload,
  FaEye,
  FaInfoCircle,
  FaTimes
} from "react-icons/fa";

interface Project {
  _id: string;
  slug: string;
  title: string;
  description: string;
  cropType?: string;
  currentFunding: number;
  fundingGoal: number;
  status: string;
  overallVerificationStatus: string;
  isApproved: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  farmerId: { _id: string; name: string; email: string };
  
  // Farmer Verification
  farmerVerification?: {
    aadhaarNumber: string;
    aadhaarDocument: string;
    govtIdType: string;
    govtIdNumber: string;
    govtIdDocument: string;
    verificationStatus: string;
    verificationNotes?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  };

  // Land Details
  landDetails?: {
    state: string;
    district: string;
    tehsil: string;
    village: string;
    panchayat: string;
    municipality?: string;
    address: {
      street?: string;
      landmark?: string;
      pincode: string;
    };
    surveyNumber: string;
    subDivisionNumber?: string;
    landArea: {
      value: number;
      unit: string;
    };
    landType: string;
    soilType?: string;
    irrigationSource?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  // Land Ownership
  landOwnership?: {
    ownershipType: string;
    ownerName: string;
    relationToOwner: string;
    documents: Array<{
      type: string;
      documentNumber: string;
      filePath: string;
      uploadedAt: string;
    }>;
    verificationStatus: string;
    verificationNotes?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  };

  // Land Media
  landMedia?: {
    photos: Array<{
      filePath: string;
      description?: string;
      geoTag?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: string;
      };
      uploadedAt: string;
    }>;
    videos: Array<{
      filePath: string;
      description?: string;
      geoTag?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: string;
      };
      uploadedAt: string;
    }>;
    minimumPhotos: number;
    minimumVideos: number;
    verificationStatus: string;
    verificationNotes?: string;
    verifiedAt?: string;
    verifiedBy?: string;
  };

  // Admin Review
  adminReview?: {
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    rejectionReason?: string;
  };
}

const currentUser = {
  id: localStorage.getItem("userId") || "",
  role: localStorage.getItem("role") || "",
};
const token = localStorage.getItem("token") || "";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [modalContent, setModalContent] = useState<{
    type: 'image' | 'video' | null;
    src: string;
    title: string;
  }>({ type: null, src: '', title: '' });
  
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com";

  // Helper function to get correct media URL
  const getMediaUrl = (filePath: string) => {
    if (!filePath) return '';
    return filePath.startsWith('http') ? filePath : `${backendUrl}/${filePath}`;
  };

  const openModal = (type: 'image' | 'video', src: string, title: string) => {
    setModalContent({ type, src: getMediaUrl(src), title });
  };

  const closeModal = () => {
    setModalContent({ type: null, src: '', title: '' });
  };

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/projects/${id}`);
        console.log("Project data:", res.data);
        if (res.data.landMedia) {
          console.log("Land media photos:", res.data.landMedia.photos);
          console.log("Land media videos:", res.data.landMedia.videos);
        }
        setProject(res.data);
      } catch (err) {
        setError("Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, backendUrl]);

  // Delete project
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await axios.delete(`${backendUrl}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/farmer/projects");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete project.");
    }
  };

  const getStatusColors = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft": 
        return "text-gray-700 bg-gray-100 border border-gray-200";
      case "submitted": 
        return "text-blue-700 bg-blue-100 border border-blue-200";
      case "under_review": 
        return "text-yellow-700 bg-yellow-100 border border-yellow-200";
      case "verified": 
        return "text-green-700 bg-green-100 border border-green-200";
      case "rejected": 
        return "text-red-700 bg-red-100 border border-red-200";
      case "open": 
        return "text-emerald-700 bg-emerald-100 border border-emerald-200";
      case "funded": 
        return "text-purple-700 bg-purple-100 border border-purple-200";
      case "closed": 
        return "text-gray-700 bg-gray-100 border border-gray-200";
      default: 
        return "text-gray-700 bg-gray-100 border border-gray-200";
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified": 
        return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected": 
        return <FaTimesCircle className="w-5 h-5 text-red-600" />;
      case "under_review": 
        return <FaClock className="w-5 h-5 text-yellow-600" />;
      case "pending": 
        return <FaExclamationTriangle className="w-5 h-5 text-gray-600" />;
      default: 
        return <FaExclamationTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-gray-900 text-xl font-semibold">Loading Project...</h3>
          <p className="text-gray-600 mt-2">Fetching project details</p>
        </div>
      </div>
    );

  if (error || !project)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h3 className="text-gray-900 text-xl font-bold mb-2">Project Not Found</h3>
          <p className="text-gray-600 mb-6">{error || "Project not found"}</p>
          <button 
            onClick={() => navigate("/farmer/projects")}
            className="flex items-center justify-center text-emerald-600 hover:text-emerald-700 font-semibold transition-all duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Projects
          </button>
        </div>
      </div>
    );

  const isOwner = project.farmerId?._id === currentUser.id;
  const canEditOrDelete = isOwner || currentUser.role === "admin";
  const progressPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);

  const tabs = [
    { id: "overview", label: "Overview", icon: FaInfoCircle },
    { id: "verification", label: "Verification", icon: FaShieldAlt },
    { id: "land", label: "Land Details", icon: FaMapMarkerAlt },
    { id: "ownership", label: "Ownership", icon: FaFileAlt },
    { id: "media", label: "Media", icon: FaCamera },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/farmer/projects")}
            className="flex items-center text-gray-600 hover:text-gray-900 font-semibold transition-all duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Projects
          </button>
          
          {canEditOrDelete && (
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/farmer/projects/edit/${project._id}`)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-300"
              >
                <FaEdit className="mr-2" />
                Edit Project
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300"
              >
                <FaTrashAlt className="mr-2" />
                Delete Project
              </button>
            </div>
          )}
        </div>

        {/* Project Header Card */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-grow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <FaRocket className="text-white text-2xl" />
                </div>
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
              
              {/* Project Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {project.cropType && (
                  <div className="flex items-center text-gray-600">
                    <FaLeaf className="w-5 h-5 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Crop Type</p>
                      <p className="font-semibold">{project.cropType}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="font-semibold">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FaUser className="w-5 h-5 mr-3 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Farmer</p>
                    <p className="font-semibold">{project.farmerId?.name}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex flex-col gap-3">
              <div className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getStatusColors(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </div>
              <div className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${getStatusColors(project.overallVerificationStatus)}`}>
                {getVerificationIcon(project.overallVerificationStatus)}
                <span className="ml-2">{project.overallVerificationStatus.replace('_', ' ')}</span>
              </div>
              {project.isApproved && (
                <div className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 border border-green-200">
                  <FaCheckCircle className="w-4 h-4 mr-2" />
                  Approved
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Funding Progress Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-emerald-600 text-xl mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Funding Progress</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-sm font-bold text-emerald-600">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">{formatCurrency(project.currentFunding)}</span>
              <span className="text-gray-600">Target: {formatCurrency(project.fundingGoal)}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-300 ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Project Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium">{formatDate(project.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium">{formatDate(project.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium">{formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Funding Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Amount:</span>
                          <span className="font-medium">{formatCurrency(project.fundingGoal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Raised Amount:</span>
                          <span className="font-medium">{formatCurrency(project.currentFunding)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-medium">{formatCurrency(project.fundingGoal - project.currentFunding)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === "verification" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Farmer Verification */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <FaShieldAlt className="w-6 h-6 text-blue-500 mr-3" />
                      <h4 className="font-semibold text-gray-900">Identity Verification</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        {getVerificationIcon(project.farmerVerification?.verificationStatus || "pending")}
                        <span className="ml-2 font-medium">
                          {project.farmerVerification?.verificationStatus?.replace('_', ' ') || "Pending"}
                        </span>
                      </div>
                      {project.farmerVerification?.verificationNotes && (
                        <p className="text-sm text-gray-600">{project.farmerVerification.verificationNotes}</p>
                      )}
                      {project.farmerVerification?.verifiedAt && (
                        <p className="text-xs text-gray-500">
                          Verified: {formatDate(project.farmerVerification.verifiedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Land Ownership Verification */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <FaFileAlt className="w-6 h-6 text-green-500 mr-3" />
                      <h4 className="font-semibold text-gray-900">Ownership Verification</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        {getVerificationIcon(project.landOwnership?.verificationStatus || "pending")}
                        <span className="ml-2 font-medium">
                          {project.landOwnership?.verificationStatus?.replace('_', ' ') || "Pending"}
                        </span>
                      </div>
                      {project.landOwnership?.verificationNotes && (
                        <p className="text-sm text-gray-600">{project.landOwnership.verificationNotes}</p>
                      )}
                      {project.landOwnership?.verifiedAt && (
                        <p className="text-xs text-gray-500">
                          Verified: {formatDate(project.landOwnership.verifiedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Media Verification */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <FaCamera className="w-6 h-6 text-purple-500 mr-3" />
                      <h4 className="font-semibold text-gray-900">Media Verification</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        {getVerificationIcon(project.landMedia?.verificationStatus || "pending")}
                        <span className="ml-2 font-medium">
                          {project.landMedia?.verificationStatus?.replace('_', ' ') || "Pending"}
                        </span>
                      </div>
                      {project.landMedia?.verificationNotes && (
                        <p className="text-sm text-gray-600">{project.landMedia.verificationNotes}</p>
                      )}
                      {project.landMedia?.verifiedAt && (
                        <p className="text-xs text-gray-500">
                          Verified: {formatDate(project.landMedia.verifiedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Review */}
                {project.adminReview && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Admin Review</h4>
                    {project.adminReview.reviewNotes && (
                      <p className="text-blue-800 mb-2">{project.adminReview.reviewNotes}</p>
                    )}
                    {project.adminReview.rejectionReason && (
                      <p className="text-red-800 mb-2">
                        <strong>Rejection Reason:</strong> {project.adminReview.rejectionReason}
                      </p>
                    )}
                    {project.adminReview.reviewedAt && (
                      <p className="text-xs text-blue-600">
                        Reviewed: {formatDate(project.adminReview.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Land Details Tab */}
            {activeTab === "land" && project.landDetails && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Land Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Administrative Details */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaMapMarkerAlt className="w-5 h-5 mr-2 text-red-500" />
                      Administrative Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">State:</span>
                        <span className="font-medium">{project.landDetails.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">District:</span>
                        <span className="font-medium">{project.landDetails.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tehsil:</span>
                        <span className="font-medium">{project.landDetails.tehsil}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Village:</span>
                        <span className="font-medium">{project.landDetails.village}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Panchayat:</span>
                        <span className="font-medium">{project.landDetails.panchayat}</span>
                      </div>
                      {project.landDetails.municipality && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Municipality:</span>
                          <span className="font-medium">{project.landDetails.municipality}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pincode:</span>
                        <span className="font-medium">{project.landDetails.address.pincode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Land Specifications */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaDatabase className="w-5 h-5 mr-2 text-blue-500" />
                      Land Specifications
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Survey Number:</span>
                        <span className="font-medium">{project.landDetails.surveyNumber}</span>
                      </div>
                      {project.landDetails.subDivisionNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sub-Division:</span>
                          <span className="font-medium">{project.landDetails.subDivisionNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Land Area:</span>
                        <span className="font-medium">
                          {project.landDetails.landArea.value} {project.landDetails.landArea.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Land Type:</span>
                        <span className="font-medium">{project.landDetails.landType}</span>
                      </div>
                      {project.landDetails.soilType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Soil Type:</span>
                          <span className="font-medium">{project.landDetails.soilType}</span>
                        </div>
                      )}
                      {project.landDetails.irrigationSource && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Irrigation:</span>
                          <span className="font-medium">{project.landDetails.irrigationSource}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaGlobe className="w-5 h-5 mr-2 text-green-500" />
                      GPS Coordinates
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latitude:</span>
                        <span className="font-medium font-mono">{project.landDetails.coordinates.latitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Longitude:</span>
                        <span className="font-medium font-mono">{project.landDetails.coordinates.longitude}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={`https://www.google.com/maps?q=${project.landDetails.coordinates.latitude},${project.landDetails.coordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-300"
                      >
                        <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                        View on Google Maps
                      </a>
                    </div>
                  </div>

                  {/* Address Details */}
                  {(project.landDetails.address.street || project.landDetails.address.landmark) && (
                    <div className="bg-gray-50 p-6 rounded-lg md:col-span-2">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <FaHome className="w-5 h-5 mr-2 text-purple-500" />
                        Address Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {project.landDetails.address.street && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Street:</span>
                            <span className="font-medium">{project.landDetails.address.street}</span>
                          </div>
                        )}
                        {project.landDetails.address.landmark && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Landmark:</span>
                            <span className="font-medium">{project.landDetails.address.landmark}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ownership Tab */}
            {activeTab === "ownership" && project.landOwnership && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Land Ownership Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ownership Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUser className="w-5 h-5 mr-2 text-blue-500" />
                      Ownership Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ownership Type:</span>
                        <span className="font-medium">{project.landOwnership.ownershipType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner Name:</span>
                        <span className="font-medium">{project.landOwnership.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Relation to Owner:</span>
                        <span className="font-medium">{project.landOwnership.relationToOwner}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaShieldAlt className="w-5 h-5 mr-2 text-green-500" />
                      Verification Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        {getVerificationIcon(project.landOwnership.verificationStatus)}
                        <span className="ml-2 font-medium">
                          {project.landOwnership.verificationStatus.replace('_', ' ')}
                        </span>
                      </div>
                      {project.landOwnership.verificationNotes && (
                        <p className="text-sm text-gray-600">{project.landOwnership.verificationNotes}</p>
                      )}
                      {project.landOwnership.verifiedAt && (
                        <p className="text-xs text-gray-500">
                          Verified: {formatDate(project.landOwnership.verifiedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FaFileAlt className="w-5 h-5 mr-2 text-purple-500" />
                    Ownership Documents ({project.landOwnership.documents.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.landOwnership.documents.map((doc, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <FaIdCard className="w-5 h-5 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.type.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-600">{doc.documentNumber}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          Uploaded: {formatDate(doc.uploadedAt)}
                        </p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.open(getMediaUrl(doc.filePath), '_blank')}
                            className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition-colors duration-300"
                          >
                            <FaEye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <a
                            href={getMediaUrl(doc.filePath)}
                            download
                            className="flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors duration-300"
                          >
                            <FaDownload className="w-3 h-3 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && project.landMedia && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Land Media</h3>
                
                {/* Media Requirements */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Media Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Minimum Photos Required:</span>
                      <span className="font-medium">{project.landMedia.minimumPhotos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Minimum Videos Required:</span>
                      <span className="font-medium">{project.landMedia.minimumVideos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Photos Uploaded:</span>
                      <span className="font-medium">{project.landMedia.photos.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Videos Uploaded:</span>
                      <span className="font-medium">{project.landMedia.videos.length}</span>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                {project.landMedia.photos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaImage className="w-5 h-5 mr-2 text-green-500" />
                      Land Photos ({project.landMedia.photos.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.landMedia.photos.map((photo, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border">
                          <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <img
                              src={getMediaUrl(photo.filePath)}
                              alt={photo.description || `Land photo ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                              onClick={() => openModal('image', photo.filePath, photo.description || `Land Photo ${index + 1}`)}
                              onError={(e) => {
                                console.log("Image failed to load:", photo.filePath);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <div class="text-center">
                                        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-xs text-gray-500">Image not available</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                          {photo.description && (
                            <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                          )}
                          {photo.geoTag && (
                            <p className="text-xs text-green-600 mb-2">
                              📍 Geo-tagged: {photo.geoTag.latitude.toFixed(6)}, {photo.geoTag.longitude.toFixed(6)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mb-3">
                            Uploaded: {formatDate(photo.uploadedAt)}
                          </p>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openModal('image', photo.filePath, photo.description || `Land Photo ${index + 1}`)}
                              className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition-colors duration-300"
                            >
                              <FaEye className="w-3 h-3 mr-1" />
                              View
                            </button>
                            <a
                              href={getMediaUrl(photo.filePath)}
                              download
                              className="flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors duration-300"
                            >
                              <FaDownload className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {project.landMedia.videos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <FaVideo className="w-5 h-5 mr-2 text-purple-500" />
                      Land Videos ({project.landMedia.videos.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.landMedia.videos.map((video, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border">
                          <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <video
                              src={getMediaUrl(video.filePath)}
                              controls
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                console.log("Video failed to load:", video.filePath);
                                const target = e.target as HTMLVideoElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <div class="text-center">
                                        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                        </svg>
                                        <p class="text-xs text-gray-500">Video not available</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          {video.description && (
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                          )}
                          {video.geoTag && (
                            <p className="text-xs text-green-600 mb-2">
                              📍 Geo-tagged: {video.geoTag.latitude.toFixed(6)}, {video.geoTag.longitude.toFixed(6)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mb-3">
                            Uploaded: {formatDate(video.uploadedAt)}
                          </p>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openModal('video', video.filePath, video.description || `Land Video ${index + 1}`)}
                              className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition-colors duration-300"
                            >
                              <FaEye className="w-3 h-3 mr-1" />
                              View
                            </button>
                            <a
                              href={getMediaUrl(video.filePath)}
                              download
                              className="flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded transition-colors duration-300"
                            >
                              <FaDownload className="w-3 h-3 mr-1" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Media Modal */}
        {modalContent.type && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{modalContent.title}</h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  <FaTimes className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                {modalContent.type === 'image' ? (
                  <img
                    src={modalContent.src}
                    alt={modalContent.title}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                ) : (
                  <video
                    src={modalContent.src}
                    controls
                    className="max-w-full max-h-[70vh] mx-auto"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}