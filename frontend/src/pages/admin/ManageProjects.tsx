// src/pages/admin/ManageProjects.tsx - Compact Redesign
import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Edit, Check, X, DollarSign, Eye, TrendingUp, Clock, AlertCircle, Search, 
  RefreshCw, CheckCircle2, XCircle, Archive, Plus, Grid3X3, List, 
  User, Leaf, Calendar, Layers, Activity, Target, MapPin, Phone, Mail,
  FileText, Image as ImageIcon, Video, Shield, ExternalLink
} from "lucide-react";
import { Layout } from "./Layout";

interface Farmer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface LandDetails {
  state: string;
  district: string;
  tehsil: string;
  village: string;
  surveyNumber: string;
  landArea: { value: number; unit: string; };
  landType: string;
  soilType?: string;
  coordinates?: { latitude: number; longitude: number; };
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  farmerId: Farmer;
  status: "open" | "funded" | "closed" | "submitted";
  isApproved: boolean;
  fundingGoal: number;
  currentFunding: number;
  cropType: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  expectedYield?: number;
  expectedROI?: number;
  landDetails?: LandDetails;
  landMedia?: {
    photos: Array<{ filePath: string; }>;
    videos: Array<{ filePath: string; }>;
  };
  farmerVerification?: {
    aadhaarNumber: string;
    verificationStatus: string;
  };
  landOwnership?: {
    ownershipType: string;
    ownerName: string;
    documents: Array<{ type: string; filePath: string; }>;
  };
}

const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "submitted" | "open" | "funded" | "closed">("all");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const token = localStorage.getItem("token");

  const getAxios = () => {
    return axios.create({
      baseURL: `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}`,
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAxios().get("/api/admin/projects");
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch projects");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Approve this project?")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/approve`);
      await fetchProjects();
      alert("Project approved!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to approve");
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/reject`, { reason });
      await fetchProjects();
      alert("Project rejected!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reject");
    }
    setActionLoading(null);
  };

  const handleClose = async (id: string) => {
    if (!window.confirm("Close this project?")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/close`);
      await fetchProjects();
      alert("Project closed!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to close");
    }
    setActionLoading(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800',
      open: 'bg-blue-100 text-blue-800',
      funded: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.closed;
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.farmerId.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesApproval = approvalFilter === "all" || 
                            (approvalFilter === "approved" && p.isApproved) ||
                            (approvalFilter === "pending" && !p.isApproved);
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const stats = {
    total: projects.length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    open: projects.filter(p => p.status === 'open').length,
    funded: projects.filter(p => p.status === 'funded').length,
    closed: projects.filter(p => p.status === 'closed').length,
    pending: projects.filter(p => !p.isApproved).length,
    totalFunding: projects.reduce((sum, p) => sum + p.currentFunding, 0),
    avgFunding: projects.length > 0 ? projects.reduce((sum, p) => sum + p.currentFunding, 0) / projects.length : 0,
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">Admin authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Project Management Hub</h1>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Comprehensive oversight and control center for farming investment projects</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full lg:w-auto">
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <button className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm sm:text-base">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total Projects', value: stats.total, color: 'bg-blue-500', icon: Target },
            { label: 'Submitted', value: stats.submitted, color: 'bg-yellow-500', icon: Clock },
            { label: 'Open', value: stats.open, color: 'bg-green-500', icon: Activity },
            { label: 'Funded', value: stats.funded, color: 'bg-purple-500', icon: TrendingUp },
            { label: 'Closed', value: stats.closed, color: 'bg-gray-500', icon: Archive },
            { label: 'Pending', value: stats.pending, color: 'bg-red-500', icon: AlertCircle },
            { label: 'Total Funding', value: formatCurrency(stats.totalFunding), color: 'bg-indigo-500', icon: DollarSign },
            { label: 'Avg Funding', value: formatCurrency(stats.avgFunding), color: 'bg-teal-500', icon: DollarSign },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-2.5 sm:p-3 lg:p-4">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ${stat.color} rounded-lg flex items-center justify-center mb-1.5 sm:mb-2 lg:mb-3`}>
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">{stat.value}</div>
              <div className="text-gray-600 text-[10px] sm:text-xs leading-tight truncate">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Compact Controls */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Approval</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
              <div className="flex bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8 text-center">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-2">Error</h3>
            <p className="text-gray-700 mb-4 text-sm sm:text-base">{error}</p>
            <button onClick={fetchProjects} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base">
              Try Again
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">No projects match your filters</p>
            <button 
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); setApprovalFilter("all"); }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" : "space-y-3"}>
            {filteredProjects.map((project) => {
              const isActionLoading = actionLoading === project._id;
              const fundingPercent = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
              
              return (
                <div key={project._id} className="bg-white rounded-lg shadow hover:shadow-md transition p-3 sm:p-4">
                  {viewMode === "grid" ? (
                    <>
                      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${getStatusColor(project.status)} truncate`}>
                          {project.status.toUpperCase()}
                        </span>
                        {!project.isApproved && (
                          <span className="px-2 py-1 rounded text-[10px] sm:text-xs font-semibold bg-red-100 text-red-700 flex-shrink-0">PENDING</span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{project.title}</h3>
                      <div className="space-y-1 mb-2 sm:mb-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{project.farmerId.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{project.cropType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{formatCurrency(project.fundingGoal)}</span>
                        </div>
                      </div>
                      <div className="mb-2 sm:mb-3">
                        <div className="flex justify-between text-[10px] sm:text-xs mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{fundingPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${fundingPercent}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetailsModal(true);
                          }}
                          className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs sm:text-sm font-medium"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {!project.isApproved ? (
                          <>
                            <button
                              onClick={() => handleApprove(project._id)}
                              disabled={isActionLoading}
                              className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm font-medium disabled:opacity-50"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(project._id)}
                              disabled={isActionLoading}
                              className="flex-1 flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs sm:text-sm font-medium disabled:opacity-50"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleClose(project._id)}
                            disabled={isActionLoading}
                            className="w-full flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs sm:text-sm font-medium disabled:opacity-50"
                          >
                            <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Close</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate flex-1 min-w-0">{project.title}</h3>
                          <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${getStatusColor(project.status)} flex-shrink-0`}>
                            {project.status.toUpperCase()}
                          </span>
                          {!project.isApproved && (
                            <span className="px-2 py-1 rounded text-[10px] sm:text-xs font-semibold bg-red-100 text-red-700 flex-shrink-0">PENDING</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm mb-2">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{project.farmerId.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{project.cropType}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{formatCurrency(project.fundingGoal)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 truncate">{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${fundingPercent}%` }} />
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900 min-w-[40px] sm:min-w-[50px] text-right">
                            {fundingPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 sm:flex-initial p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!project.isApproved ? (
                          <>
                            <button
                              onClick={() => handleApprove(project._id)}
                              disabled={isActionLoading}
                              className="flex-1 sm:flex-initial p-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(project._id)}
                              disabled={isActionLoading}
                              className="flex-1 sm:flex-initial p-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleClose(project._id)}
                            disabled={isActionLoading}
                            className="flex-1 sm:flex-initial p-2 bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                            title="Close"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Project Details Modal */}
        {showDetailsModal && selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 lg:p-6 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-lg lg:text-2xl font-bold text-white truncate">{selectedProject.title}</h2>
                    <p className="text-blue-100 text-[10px] sm:text-xs lg:text-sm truncate">Complete Project Details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedProject(null);
                  }}
                  className="text-white/80 hover:text-white transition p-1.5 sm:p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(90vh-100px)] p-3 sm:p-4 lg:p-6">
                {/* Status Bar */}
                <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-[10px] sm:text-xs lg:text-sm font-semibold ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.toUpperCase()}
                      </span>
                      {!selectedProject.isApproved && (
                        <span className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-lg text-[10px] sm:text-xs lg:text-sm font-semibold bg-red-100 text-red-700">
                          PENDING APPROVAL
                        </span>
                      )}
                      <span className="text-gray-600 text-[10px] sm:text-xs lg:text-sm">ID: #{selectedProject._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      {!selectedProject.isApproved ? (
                        <>
                          <button
                            onClick={() => {
                              handleApprove(selectedProject._id);
                              setShowDetailsModal(false);
                            }}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-xs sm:text-sm lg:text-base"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              handleReject(selectedProject._id);
                              setShowDetailsModal(false);
                            }}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs sm:text-sm lg:text-base"
                          >
                            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            handleClose(selectedProject._id);
                            setShowDetailsModal(false);
                          }}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-xs sm:text-sm lg:text-base"
                        >
                          <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Close Project
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {/* Project Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                      Project Information
                    </h3>
                    <div className="space-y-2 sm:space-y-2.5 lg:space-y-3 text-xs sm:text-sm lg:text-base">
                      <div>
                        <label className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Title</label>
                        <p className="font-semibold text-gray-900">{selectedProject.title}</p>
                      </div>
                      {selectedProject.description && (
                        <div>
                          <label className="text-[10px] sm:text-xs lg:text-sm text-gray-600">Description</label>
                          <p className="text-gray-900">{selectedProject.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Crop Type</label>
                          <p className="font-semibold text-gray-900">{selectedProject.cropType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Status</label>
                          <p className="font-semibold text-gray-900">{selectedProject.status}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Funding Goal</label>
                          <p className="font-semibold text-gray-900">{formatCurrency(selectedProject.fundingGoal)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Current Funding</label>
                          <p className="font-semibold text-gray-900">{formatCurrency(selectedProject.currentFunding)}</p>
                        </div>
                      </div>
                      {selectedProject.expectedYield && (
                        <div>
                          <label className="text-sm text-gray-600">Expected Yield</label>
                          <p className="font-semibold text-gray-900">{selectedProject.expectedYield} kg</p>
                        </div>
                      )}
                      {selectedProject.expectedROI && (
                        <div>
                          <label className="text-sm text-gray-600">Expected ROI</label>
                          <p className="font-semibold text-gray-900">{selectedProject.expectedROI}%</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProject.startDate && (
                          <div>
                            <label className="text-sm text-gray-600">Start Date</label>
                            <p className="font-semibold text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {selectedProject.endDate && (
                          <div>
                            <label className="text-sm text-gray-600">End Date</label>
                            <p className="font-semibold text-gray-900">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Created At</label>
                        <p className="font-semibold text-gray-900">{new Date(selectedProject.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Farmer Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 lg:p-6">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                      Farmer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <p className="font-semibold text-gray-900">{selectedProject.farmerId.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedProject.farmerId.email}
                        </p>
                      </div>
                      {selectedProject.farmerId.phone && (
                        <div>
                          <label className="text-sm text-gray-600">Phone</label>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {selectedProject.farmerId.phone}
                          </p>
                        </div>
                      )}
                      {selectedProject.farmerVerification && (
                        <>
                          <div>
                            <label className="text-sm text-gray-600">Aadhaar Number</label>
                            <p className="font-semibold text-gray-900">{selectedProject.farmerVerification.aadhaarNumber}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Verification Status</label>
                            <p className="font-semibold text-gray-900">{selectedProject.farmerVerification.verificationStatus}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Land Details */}
                  {selectedProject.landDetails && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        Land Details
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-600">State</label>
                            <p className="font-semibold text-gray-900">{selectedProject.landDetails.state}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">District</label>
                            <p className="font-semibold text-gray-900">{selectedProject.landDetails.district}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-600">Tehsil</label>
                            <p className="font-semibold text-gray-900">{selectedProject.landDetails.tehsil}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Village</label>
                            <p className="font-semibold text-gray-900">{selectedProject.landDetails.village}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Survey Number</label>
                          <p className="font-semibold text-gray-900">{selectedProject.landDetails.surveyNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Land Area</label>
                          <p className="font-semibold text-gray-900">
                            {selectedProject.landDetails.landArea.value} {selectedProject.landDetails.landArea.unit}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-600">Land Type</label>
                            <p className="font-semibold text-gray-900">{selectedProject.landDetails.landType}</p>
                          </div>
                          {selectedProject.landDetails.soilType && (
                            <div>
                              <label className="text-sm text-gray-600">Soil Type</label>
                              <p className="font-semibold text-gray-900">{selectedProject.landDetails.soilType}</p>
                            </div>
                          )}
                        </div>
                        {selectedProject.landDetails.coordinates && (
                          <div>
                            <label className="text-sm text-gray-600">Coordinates</label>
                            <p className="font-semibold text-gray-900">
                              {selectedProject.landDetails.coordinates.latitude}, {selectedProject.landDetails.coordinates.longitude}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Land Ownership */}
                  {selectedProject.landOwnership && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Land Ownership
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">Ownership Type</label>
                          <p className="font-semibold text-gray-900">{selectedProject.landOwnership.ownershipType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Owner Name</label>
                          <p className="font-semibold text-gray-900">{selectedProject.landOwnership.ownerName}</p>
                        </div>
                        {selectedProject.landOwnership.documents && selectedProject.landOwnership.documents.length > 0 && (
                          <div>
                            <label className="text-sm text-gray-600 mb-2 block">Documents</label>
                            <div className="space-y-2">
                              {selectedProject.landOwnership.documents.map((doc, idx) => (
                                <a
                                  key={idx}
                                  href={`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/${doc.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  <FileText className="w-4 h-4" />
                                  {doc.type}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Land Media */}
                  {selectedProject.landMedia && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-orange-600" />
                        Land Media
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Photos */}
                        {selectedProject.landMedia.photos && selectedProject.landMedia.photos.length > 0 && (
                          <div>
                            <label className="text-sm text-gray-600 mb-2 block">Photos ({selectedProject.landMedia.photos.length})</label>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedProject.landMedia.photos.slice(0, 6).map((photo, idx) => (
                                <a
                                  key={idx}
                                  href={`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/${photo.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-80 transition"
                                >
                                  <img
                                    src={`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/${photo.filePath}`}
                                    alt={`Land photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                            {selectedProject.landMedia.photos.length > 6 && (
                              <p className="text-sm text-gray-600 mt-2">+{selectedProject.landMedia.photos.length - 6} more photos</p>
                            )}
                          </div>
                        )}

                        {/* Videos */}
                        {selectedProject.landMedia.videos && selectedProject.landMedia.videos.length > 0 && (
                          <div>
                            <label className="text-sm text-gray-600 mb-2 block">Videos ({selectedProject.landMedia.videos.length})</label>
                            <div className="space-y-2">
                              {selectedProject.landMedia.videos.map((video, idx) => (
                                <a
                                  key={idx}
                                  href={`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/${video.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  <Video className="w-4 h-4" />
                                  Video {idx + 1}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageProjects;
