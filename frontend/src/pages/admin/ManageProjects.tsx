// src/pages/admin/ManageProjects.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Check, X, DollarSign, Eye, Zap, TrendingUp, Clock, AlertCircle, Search, Filter, Download } from "lucide-react";
import { Layout } from "./Layout";

interface Farmer {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  title: string;
  slug: string;
  farmerId: Farmer;
  status: "open" | "funded" | "closed";
  isApproved: boolean;
  fundingGoal: number;
  currentFunding: number;
  createdAt?: string;
}

const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "funded" | "closed">("all");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");

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
      baseURL: "https://agricorus.onrender.com",
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
    if (!confirmAction("Are you sure you want to approve this project?")) return;
    try {
      await getAxios().patch(`/api/projects/projects/${id}/approve`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to approve project");
    }
  };

  const handleClose = async (id: string) => {
    if (!confirmAction("Are you sure you want to close this project?")) return;
    try {
      await getAxios().patch(`/api/projects/projects/${id}/close`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to close project");
    }
  };

  const handleMarkFunded = async (id: string) => {
    if (!confirmAction("Mark this project as funded?")) return;
    try {
      await getAxios().patch(`/api/projects/projects/${id}/mark-funded`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to mark project funded");
    }
  };

  const handleEdit = (projectId: string) => {
    alert("Update feature to implement");
  };

  // ❌ handleView function has been removed as requested:
  // const handleView = (projectId: string) => {
  //   window.open(`/projects/${projectId}`, '_blank');
  // };

  const getFundingPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'from-blue-500 to-cyan-500';
      case 'funded': return 'from-green-500 to-emerald-500';
      case 'closed': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Clock;
      case 'funded': return TrendingUp;
      case 'closed': return X;
      default: return AlertCircle;
    }
  };

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.farmerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.farmerId.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesApproval = approvalFilter === "all" || 
                            (approvalFilter === "approved" && project.isApproved) ||
                            (approvalFilter === "pending" && !project.isApproved);
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const stats = {
    total: projects.length,
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
                Project Management
              </h1>
              <p className="text-gray-300 font-['Inter']">Monitor and manage all farming investment projects</p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter']"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter']"
              >
                <option value="all">All Status</option>
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'TOTAL', value: stats.total, color: 'from-purple-500 to-pink-500' },
            { label: 'OPEN', value: stats.open, color: 'from-blue-500 to-cyan-500' },
            { label: 'FUNDED', value: stats.funded, color: 'from-green-500 to-emerald-500' },
            { label: 'CLOSED', value: stats.closed, color: 'from-gray-500 to-gray-600' },
            { label: 'PENDING', value: stats.pending, color: 'from-yellow-500 to-orange-500' },
          ].map((stat, index) => (
            <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold text-white font-['Poppins'] bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm font-['Inter'] uppercase tracking-wide mt-1">
                {stat.label}
              </div>
            </div>
          ))}
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
              return (
                <div key={project._id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.01] group">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        {/* Project Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(project.status)}`}>
                            <StatusIcon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white font-['Poppins'] group-hover:text-[#ff6b6b] transition-colors cursor-pointer">
                            {project.title}
                          </h3>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium font-['Inter'] bg-gradient-to-r ${getStatusColor(project.status)} text-white`}>
                              {project.status.toUpperCase()}
                            </span>
                            {!project.isApproved && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium font-['Inter'] bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                PENDING APPROVAL
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Project Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="font-['Inter'] font-medium">Farmer:</span>
                              <span className="font-['Inter']">{project.farmerId.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="font-['Inter'] font-medium">Email:</span>
                              <span className="font-['Inter']">{project.farmerId.email}</span>
                            </div>
                            {project.createdAt && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-['Inter'] font-medium">Created:</span>
                                <span className="font-['Inter']">{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Funding Progress */}
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm text-gray-300 font-['Inter']">
                              <span>Funding Progress</span>
                              <span className="font-semibold">
                                ₹{project.currentFunding.toLocaleString()} / ₹{project.fundingGoal.toLocaleString()}
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
                            <div className="text-right text-sm text-gray-400 font-['Inter']">
                              {getFundingPercentage(project.currentFunding, project.fundingGoal).toFixed(1)}% funded
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[200px]">
                        {/* ❌ View button removed as requested:
                        <button
                          onClick={() => handleView(project._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 border border-white/20 hover:border-white/40 font-['Inter'] font-medium"
                        >
                          <Eye size={16} />
                          View
                        </button> */}
                        <button
                          onClick={() => handleEdit(project._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all duration-300 border border-yellow-500/30 hover:border-yellow-500/50 font-['Inter'] font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        {!project.isApproved && (
                          <button
                            onClick={() => handleApprove(project._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-300 border border-green-500/30 hover:border-green-500/50 font-['Inter'] font-medium"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                        )}
                        {project.status !== "closed" && (
                          <button
                            onClick={() => handleClose(project._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 border border-red-500/30 hover:border-red-500/50 font-['Inter'] font-medium"
                          >
                            <X size={16} />
                            Close
                          </button>
                        )}
                        {project.status !== "funded" && (
                          <button
                            onClick={() => handleMarkFunded(project._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50 font-['Inter'] font-medium"
                          >
                            <DollarSign size={16} />
                            Mark Funded
                          </button>
                        )}
                      </div>
                    </div>
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