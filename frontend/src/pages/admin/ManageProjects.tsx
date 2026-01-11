// src/pages/admin/ManageProjects.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Edit, 
  Check, 
  X, 
  DollarSign, 
  Eye, 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download,
  User,
  MapPin,
  Calendar,
  FileText,
  Image,
  Video,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Leaf,
  Target,
  Activity
} from "lucide-react";
import { Layout } from "./Layout";

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface LandDetails {
  district: string;
  village: string;
  panchayat: string;
  address: string;
  area: number;
  soilType: string;
}

interface FarmerIdentity {
  aadhaarNumber: string;
  govtIdType: string;
  govtIdNumber: string;
  verificationStatus: string;
}

interface LandOwnership {
  documentType: string;
  documentNumber: string;
  verificationStatus: string;
}

interface MediaFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadDate: string;
  geoTag?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  farmerId: Farmer;
  status: "submitted" | "open" | "funded" | "closed";
  isApproved: boolean;
  fundingGoal: number;
  currentFunding: number;
  cropType: string;
  expectedYield: number;
  projectDuration: number;
  riskFactors: string[];
  expectedROI: number;
  createdAt: string;
  updatedAt: string;
  
  // Verification fields
  farmerIdentity?: FarmerIdentity;
  landDetails?: LandDetails;
  landOwnership?: LandOwnership;
  landPhotos?: MediaFile[];
  landVideos?: MediaFile[];
  ownershipDocuments?: MediaFile[];
  
  // Admin fields
  adminNotes?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "open" | "funded" | "closed">("all");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium font-['Poppins']">
            Authentication Required
          </p>
          <p className="text-gray-300 font-['Inter'] mt-2">
            You must be logged in as admin to view this page.
          </p>
        </div>
      </div>
    );
  }

  const getAxios = () =>
    axios.create({
      baseURL: "http://localhost:5000",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAxios().get("/api/projects/admin/projects");
      setProjects(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch projects");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const confirmAction = (message: string) => window.confirm(message);

  const handleApprove = async (id: string) => {
    if (!confirmAction("Are you sure you want to approve this project? This will make it visible to investors.")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/projects/${id}/approve`);
      await fetchProjects();
      alert("Project approved successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to approve project");
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/projects/${id}/reject`, { reason });
      await fetchProjects();
      alert("Project rejected successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reject project");
    }
    setActionLoading(null);
  };

  const handleClose = async (id: string) => {
    if (!confirmAction("Are you sure you want to close this project? This action cannot be undone.")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/projects/${id}/close`);
      await fetchProjects();
      alert("Project closed successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to close project");
    }
    setActionLoading(null);
  };

  const handleMarkFunded = async (id: string) => {
    if (!confirmAction("Mark this project as fully funded?")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/projects/${id}/mark-funded`);
      await fetchProjects();
      alert("Project marked as funded successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to mark project funded");
    }
    setActionLoading(null);
  };

  const handleEdit = (projectId: string) => {
    window.open(`/admin/projects/edit/${projectId}`, '_blank');
  };

  const handleViewDetails = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const getFundingPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'from-yellow-500 to-orange-500';
      case 'open': return 'from-blue-500 to-cyan-500';
      case 'funded': return 'from-green-500 to-emerald-500';
      case 'closed': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return Clock;
      case 'open': return Activity;
      case 'funded': return TrendingUp;
      case 'closed': return X;
      default: return AlertCircle;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.farmerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.farmerId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesApproval = approvalFilter === "all" || 
                            (approvalFilter === "approved" && project.isApproved) ||
                            (approvalFilter === "pending" && !project.isApproved);
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const stats = {
    total: projects.length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    open: projects.filter(p => p.status === 'open').length,
    funded: projects.filter(p => p.status === 'funded').length,
    closed: projects.filter(p => p.status === 'closed').length,
    pending: projects.filter(p => !p.isApproved).length,
  };

  return (
    <Layout>
      <div className="min-h-screen p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider font-['Poppins'] mb-2">
                Project Management Dashboard
              </h1>
              <p className="text-gray-300 font-['Inter']">Review, verify and manage all farming investment projects</p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, farmers, crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter'] min-w-[250px]"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter']"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="open">Open</option>
                <option value="funded">Funded</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter']"
              >
                <option value="all">All Approval</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'TOTAL', value: stats.total, color: 'from-purple-500 to-pink-500', icon: Target },
            { label: 'SUBMITTED', value: stats.submitted, color: 'from-yellow-500 to-orange-500', icon: Clock },
            { label: 'OPEN', value: stats.open, color: 'from-blue-500 to-cyan-500', icon: Activity },
            { label: 'FUNDED', value: stats.funded, color: 'from-green-500 to-emerald-500', icon: TrendingUp },
            { label: 'CLOSED', value: stats.closed, color: 'from-gray-500 to-gray-600', icon: X },
            { label: 'PENDING', value: stats.pending, color: 'from-red-500 to-pink-500', icon: AlertCircle },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
                <div className={`text-2xl font-bold text-white font-['Poppins'] bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs font-['Inter'] uppercase tracking-wide mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3b3b]"></div>
            </div>
            <p className="text-gray-300 font-medium font-['Inter']">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-medium font-['Poppins'] text-lg mb-2">Error Loading Projects</p>
            <p className="text-gray-300 font-['Inter']">{error}</p>
            <button 
              onClick={fetchProjects}
              className="mt-4 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
            >
              Retry
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-12 text-center">
            <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300 text-lg font-['Inter'] mb-2">No projects found</p>
            <p className="text-gray-400 font-['Inter']">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProjects.map((project) => {
              const StatusIcon = getStatusIcon(project.status);
              const isExpanded = expandedProject === project._id;
              const isActionLoading = actionLoading === project._id;
              
              return (
                <div key={project._id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group">
                  <div className="p-6">
                    {/* Project Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(project.status)}`}>
                            <StatusIcon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white font-['Poppins'] group-hover:text-[#ff6b6b] transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium font-['Inter'] bg-gradient-to-r ${getStatusColor(project.status)} text-white`}>
                              {project.status.toUpperCase()}
                            </span>
                            {!project.isApproved && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium font-['Inter'] bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                                PENDING APPROVAL
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Quick Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-400">Farmer</div>
                              <div className="font-medium">{project.farmerId.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Leaf className="w-4 h-4 text-green-400" />
                            <div>
                              <div className="text-xs text-gray-400">Crop Type</div>
                              <div className="font-medium">{project.cropType}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <DollarSign className="w-4 h-4 text-yellow-400" />
                            <div>
                              <div className="text-xs text-gray-400">Funding Goal</div>
                              <div className="font-medium">{formatCurrency(project.fundingGoal)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <div>
                              <div className="text-xs text-gray-400">Duration</div>
                              <div className="font-medium">{project.projectDuration} months</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[200px]">
                        <button
                          onClick={() => handleViewDetails(project._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 font-['Inter'] font-medium"
                        >
                          <Eye size={16} />
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {!project.isApproved && (
                          <>
                            <button
                              onClick={() => handleApprove(project._id)}
                              disabled={isActionLoading}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300 border border-green-500/30 hover:border-green-500/50 font-['Inter'] font-medium disabled:opacity-50"
                            >
                              <Check size={16} />
                              {isActionLoading ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(project._id)}
                              disabled={isActionLoading}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 border border-red-500/30 hover:border-red-500/50 font-['Inter'] font-medium disabled:opacity-50"
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleEdit(project._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all duration-300 border border-yellow-500/30 hover:border-yellow-500/50 font-['Inter'] font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        
                        {project.status !== "closed" && (
                          <button
                            onClick={() => handleClose(project._id)}
                            disabled={isActionLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition-all duration-300 border border-gray-500/30 hover:border-gray-500/50 font-['Inter'] font-medium disabled:opacity-50"
                          >
                            <X size={16} />
                            Close
                          </button>
                        )}
                        
                        {project.status !== "funded" && project.isApproved && (
                          <button
                            onClick={() => handleMarkFunded(project._id)}
                            disabled={isActionLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50 font-['Inter'] font-medium disabled:opacity-50"
                          >
                            <DollarSign size={16} />
                            Mark Funded
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-300 font-['Inter'] mb-2">
                        <span>Funding Progress</span>
                        <span className="font-semibold">
                          {formatCurrency(project.currentFunding)} / {formatCurrency(project.fundingGoal)}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25"
                          style={{ 
                            width: `${getFundingPercentage(project.currentFunding, project.fundingGoal)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-right text-sm text-gray-400 font-['Inter'] mt-1">
                        {getFundingPercentage(project.currentFunding, project.fundingGoal).toFixed(1)}% funded
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-white/20 pt-6 mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Left Column - Project Details */}
                          <div className="space-y-6">
                            {/* Project Description */}
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Project Description
                              </h4>
                              <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>
                            </div>

                            {/* Project Metrics */}
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Project Metrics
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Expected Yield</div>
                                  <div className="text-white font-medium">{project.expectedYield} tons</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Expected ROI</div>
                                  <div className="text-white font-medium">{project.expectedROI}%</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Created</div>
                                  <div className="text-white font-medium">{formatDate(project.createdAt)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Last Updated</div>
                                  <div className="text-white font-medium">{formatDate(project.updatedAt)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Risk Factors */}
                            {project.riskFactors && project.riskFactors.length > 0 && (
                              <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Risk Factors
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {project.riskFactors.map((risk, index) => (
                                    <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                                      {risk}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column - Farmer & Verification Details */}
                          <div className="space-y-6">
                            {/* Farmer Information */}
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Farmer Information
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-blue-400" />
                                  <span className="text-gray-300">{project.farmerId.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-green-400" />
                                  <span className="text-gray-300">{project.farmerId.email}</span>
                                </div>
                                {project.farmerId.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-yellow-400" />
                                    <span className="text-gray-300">{project.farmerId.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Land Details */}
                            {project.landDetails && (
                              <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Land Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="text-gray-400">District:</span> <span className="text-white">{project.landDetails.district}</span></div>
                                  <div><span className="text-gray-400">Village:</span> <span className="text-white">{project.landDetails.village}</span></div>
                                  <div><span className="text-gray-400">Panchayat:</span> <span className="text-white">{project.landDetails.panchayat}</span></div>
                                  <div><span className="text-gray-400">Area:</span> <span className="text-white">{project.landDetails.area} acres</span></div>
                                  <div><span className="text-gray-400">Soil Type:</span> <span className="text-white">{project.landDetails.soilType}</span></div>
                                </div>
                              </div>
                            )}

                            {/* Verification Status */}
                            {project.farmerIdentity && (
                              <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Verification Status
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="text-gray-400">Identity:</span> 
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                      project.farmerIdentity.verificationStatus === 'verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                      {project.farmerIdentity.verificationStatus}
                                    </span>
                                  </div>
                                  {project.landOwnership && (
                                    <div><span className="text-gray-400">Land Ownership:</span> 
                                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                        project.landOwnership.verificationStatus === 'verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                      }`}>
                                        {project.landOwnership.verificationStatus}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Media Files */}
                            {(project.landPhotos?.length || project.landVideos?.length || project.ownershipDocuments?.length) && (
                              <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                  <Image className="w-4 h-4" />
                                  Uploaded Media
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {project.landPhotos?.length && (
                                    <div className="flex items-center gap-2">
                                      <Image className="w-4 h-4 text-blue-400" />
                                      <span className="text-gray-300">{project.landPhotos.length} Land Photos</span>
                                    </div>
                                  )}
                                  {project.landVideos?.length && (
                                    <div className="flex items-center gap-2">
                                      <Video className="w-4 h-4 text-purple-400" />
                                      <span className="text-gray-300">{project.landVideos.length} Land Videos</span>
                                    </div>
                                  )}
                                  {project.ownershipDocuments?.length && (
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-green-400" />
                                      <span className="text-gray-300">{project.ownershipDocuments.length} Ownership Documents</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        {filteredProjects.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 font-['Inter']">
              <span>Showing {filteredProjects.length} of {projects.length} projects</span>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Submitted: {stats.submitted}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Open: {stats.open}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Funded: {stats.funded}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  Closed: {stats.closed}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageProjects;