// src/pages/farmer/projects/ViewProjects.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaPlus, 
  FaSearch, 
  FaRocket, 
  FaChartLine, 
  FaDatabase,
  FaMapMarkerAlt,
  FaLeaf,
  FaShieldAlt,
  FaCamera,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle
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
  farmerId: { _id: string; name: string; email: string };
  landDetails?: {
    state: string;
    district: string;
    village: string;
    landArea: {
      value: number;
      unit: string;
    };
    landType: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  farmerVerification?: {
    verificationStatus: string;
  };
  landOwnership?: {
    verificationStatus: string;
  };
  landMedia?: {
    photos: any[];
    videos: any[];
    verificationStatus: string;
  };
}

const currentUser = {
  id: localStorage.getItem("userId") || "",
  role: localStorage.getItem("role") || "",
};
const token = localStorage.getItem("token") || "";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export default function ViewProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/projects");
        if (Array.isArray(res.data)) {
          setProjects(res.data);
          setFilteredProjects(res.data);
        } else {
          setError("The API did not return an array of projects.");
          setProjects([]);
          setFilteredProjects([]);
        }
      } catch (err) {
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.cropType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.landDetails?.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.landDetails?.district.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Verification filter
    if (verificationFilter !== "all") {
      filtered = filtered.filter(project => project.overallVerificationStatus === verificationFilter);
    }

    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, verificationFilter, projects]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete project.");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/farmer/projects/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/farmer/projects/${id}`);
  };

  const getStatusColors = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft": 
        return "text-gray-700 bg-gray-100 border border-gray-200";
      case "submitted": 
        return "text-blue-700 bg-blue-100 border border-blue-200";
      case "open": 
        return "text-green-700 bg-green-100 border border-green-200";
      case "funded": 
        return "text-purple-700 bg-purple-100 border border-purple-200";
      case "closed": 
        return "text-red-700 bg-red-100 border border-red-200";
      default: 
        return "text-gray-700 bg-gray-100 border border-gray-200";
    }
  };

  const getVerificationStatusColors = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft": 
        return "text-gray-600 bg-gray-50";
      case "submitted": 
        return "text-blue-600 bg-blue-50";
      case "under_review": 
        return "text-yellow-600 bg-yellow-50";
      case "verified": 
        return "text-green-600 bg-green-50";
      case "rejected": 
        return "text-red-600 bg-red-50";
      default: 
        return "text-gray-600 bg-gray-50";
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified": 
        return <FaCheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected": 
        return <FaTimesCircle className="w-4 h-4 text-red-600" />;
      case "under_review": 
        return <FaClock className="w-4 h-4 text-yellow-600" />;
      default: 
        return <FaExclamationTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-gray-900 text-xl font-semibold">Loading Projects...</h3>
          <p className="text-gray-600 mt-2">Fetching your project dashboard</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h3 className="text-gray-900 text-xl font-bold mb-2">Error Loading Projects</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <FaDatabase className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Project Dashboard
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Manage and monitor your agricultural initiatives
            </p>
          </div>
          
          <button
            onClick={() => navigate("/farmer/projects/add")}
            className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <FaRocket className="mr-2 text-sm" />
            New Project
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900 placeholder-gray-500 w-full transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="open">Open</option>
              <option value="funded">Funded</option>
              <option value="closed">Closed</option>
            </select>

            {/* Verification Filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 text-gray-900"
            >
              <option value="all">All Verification</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setVerificationFilter("all");
              }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <div className="text-4xl">📋</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || statusFilter !== "all" || verificationFilter !== "all" ? "No Projects Found" : "No Active Projects"}
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md">
              {searchQuery || statusFilter !== "all" || verificationFilter !== "all"
                ? "Adjust your search parameters and try again" 
                : "Create your first agricultural project to get started"
              }
            </p>
            {!searchQuery && statusFilter === "all" && verificationFilter === "all" && (
              <button
                onClick={() => navigate("/farmer/projects/add")}
                className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                <FaRocket className="mr-3" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isOwner = project.farmerId?._id === currentUser.id;
              const canEditOrDelete = isOwner || currentUser.role === "admin";
              const progressPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);

              return (
                <div
                  key={project._id}
                  className="group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col"
                >
                  <div className="p-6 flex-grow">
                    {/* Header with Status */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-gray-900 line-clamp-2 flex-grow mr-3" style={{ minHeight: '64px' }}>
                        {project.title}
                      </h2>
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${getStatusColors(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <div className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ${getVerificationStatusColors(project.overallVerificationStatus)}`}>
                          {getVerificationIcon(project.overallVerificationStatus)}
                          <span className="ml-1">{project.overallVerificationStatus.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Project Info */}
                    <div className="space-y-3 mb-4">
                      {project.cropType && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaLeaf className="w-4 h-4 mr-2 text-green-500" />
                          <span>{project.cropType}</span>
                        </div>
                      )}
                      
                      {project.landDetails && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500" />
                          <span>{project.landDetails.village}, {project.landDetails.district}, {project.landDetails.state}</span>
                        </div>
                      )}

                      {project.landDetails?.landArea && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FaDatabase className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{project.landDetails.landArea.value} {project.landDetails.landArea.unit} - {project.landDetails.landType}</span>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600">
                        <FaClock className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Created: {formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="mt-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-semibold text-gray-700">Funding Progress</span>
                        <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-900">{formatCurrency(project.currentFunding)}</span>
                        <span className="text-gray-600">Target: {formatCurrency(project.fundingGoal)}</span>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                            project.farmerVerification?.verificationStatus === 'VERIFIED' ? 'bg-green-100' : 
                            project.farmerVerification?.verificationStatus === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <FaShieldAlt className={`w-3 h-3 ${
                              project.farmerVerification?.verificationStatus === 'VERIFIED' ? 'text-green-600' : 
                              project.farmerVerification?.verificationStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className="text-gray-600">Identity</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                            project.landOwnership?.verificationStatus === 'VERIFIED' ? 'bg-green-100' : 
                            project.landOwnership?.verificationStatus === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <FaFileAlt className={`w-3 h-3 ${
                              project.landOwnership?.verificationStatus === 'VERIFIED' ? 'text-green-600' : 
                              project.landOwnership?.verificationStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className="text-gray-600">Ownership</span>
                        </div>
                        <div className="text-center">
                          <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center ${
                            project.landMedia?.verificationStatus === 'VERIFIED' ? 'bg-green-100' : 
                            project.landMedia?.verificationStatus === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <FaCamera className={`w-3 h-3 ${
                              project.landMedia?.verificationStatus === 'VERIFIED' ? 'text-green-600' : 
                              project.landMedia?.verificationStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className="text-gray-600">Media</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleView(project._id)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-all duration-300 group/view"
                      >
                        <span className="flex items-center">
                          View Details
                          <FaChartLine className="ml-2 group-hover/view:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>
                      
                      {canEditOrDelete && (
                        <div className="flex space-x-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(project._id); }}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-300"
                            title="Edit project"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                            title="Delete project"
                          >
                            <FaTrashAlt className="text-lg" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white rounded-lg shadow-sm border px-6 py-3">
              <span className="text-gray-600 text-sm font-medium">
                Displaying <span className="text-gray-900 font-bold">{filteredProjects.length}</span> of <span className="text-gray-900 font-bold">{projects.length}</span> Projects
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}