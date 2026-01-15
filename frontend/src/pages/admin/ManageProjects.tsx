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
  Activity,
  BarChart3,
  Settings,
  RefreshCw,
  Star,
  Bookmark,
  Share2,
  MessageSquare,
  Bell,
  Archive,
  Trash2,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Layers,
  PieChart,
  TrendingDown,
  Globe,
  Award,
  Briefcase,
  Camera,
  PlayCircle,
  FileCheck,
  MapIcon,
  Coins,
  Timer,
  Users,
  ChartLine,
  Percent,
  Calendar as CalendarIcon,
  Hash,
  Tag,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLinkIcon
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
}

interface FarmerVerification {
  aadhaarNumber: string;
  aadhaarDocument: string;
  govtIdType: string;
  govtIdNumber: string;
  govtIdDocument: string;
  verificationStatus: string;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

interface LandOwnership {
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
}

interface MediaFile {
  filePath: string;
  description?: string;
  geoTag?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  uploadedAt: string;
}

interface LandMedia {
  photos: MediaFile[];
  videos: Array<MediaFile & { duration?: number }>;
  minimumPhotos: number;
  minimumVideos: number;
  verificationStatus: string;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

interface AdminReview {
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
}

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  farmerId: Farmer;
  status: "open" | "funded" | "closed";
  isApproved: boolean;
  fundingGoal: number;
  currentFunding: number;
  cropType?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Verification fields (matching actual model)
  farmerVerification?: FarmerVerification;
  landDetails?: LandDetails;
  landOwnership?: LandOwnership;
  landMedia?: LandMedia;
  
  // Overall verification
  overallVerificationStatus?: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
  
  // Admin review
  adminReview?: AdminReview;
  
  // Legacy fields for backward compatibility
  expectedYield?: number;
  projectDuration?: number;
  riskFactors?: string[];
  expectedROI?: number;
  farmerIdentity?: FarmerVerification; // alias for farmerVerification
  landPhotos?: MediaFile[]; // alias for landMedia.photos
  landVideos?: MediaFile[]; // alias for landMedia.videos
  ownershipDocuments?: MediaFile[]; // alias for landOwnership.documents
  adminNotes?: string; // alias for adminReview.reviewNotes
  verificationStatus?: string; // alias for overallVerificationStatus
  rejectionReason?: string; // alias for adminReview.rejectionReason
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"date" | "funding" | "name" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-300 mb-8 text-lg">Admin authentication required to access project management dashboard.</p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
            Login as Admin
          </button>
        </div>
      </div>
    );
  }

  const getAxios = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }
    return axios.create({
      baseURL: "http://localhost:5000",
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
      console.error(err);
      let errorMessage = "Failed to fetch projects";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Your session may have expired. Please login again.";
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === "No authentication token found. Please login again.") {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatAddress = (address: { street?: string; landmark?: string; pincode: string } | undefined): string => {
    if (!address) return 'Address not provided';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.landmark) parts.push(address.landmark);
    if (address.pincode) parts.push(address.pincode);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not provided';
  };

  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const confirmAction = (message: string) => window.confirm(message);

  const handleApprove = async (id: string) => {
    if (!confirmAction("Are you sure you want to approve this project? This will make it visible to investors.")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/approve`);
      await fetchProjects();
      alert("Project approved successfully!");
    } catch (err: any) {
      console.error("Approve error:", err);
      let errorMessage = "Failed to approve project";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.status === 404) {
        errorMessage = "Project not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === "No authentication token found. Please login again.") {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/reject`, { reason });
      await fetchProjects();
      alert("Project rejected successfully!");
    } catch (err: any) {
      console.error("Reject error:", err);
      let errorMessage = "Failed to reject project";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.status === 404) {
        errorMessage = "Project not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === "No authentication token found. Please login again.") {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
    setActionLoading(null);
  };

  const handleClose = async (id: string) => {
    if (!confirmAction("Are you sure you want to close this project? This action cannot be undone.")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/close`);
      await fetchProjects();
      alert("Project closed successfully!");
    } catch (err: any) {
      console.error("Close error:", err);
      let errorMessage = "Failed to close project";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.status === 404) {
        errorMessage = "Project not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === "No authentication token found. Please login again.") {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
    setActionLoading(null);
  };

  const handleMarkFunded = async (id: string) => {
    if (!confirmAction("Mark this project as fully funded?")) return;
    setActionLoading(id);
    try {
      await getAxios().patch(`/api/admin/projects/${id}/mark-funded`);
      await fetchProjects();
      alert("Project marked as funded successfully!");
    } catch (err: any) {
      console.error("Mark funded error:", err);
      let errorMessage = "Failed to mark project funded";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.status === 404) {
        errorMessage = "Project not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === "No authentication token found. Please login again.") {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
    setActionLoading(null);
  };

  const handleViewDetails = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const getFundingPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'bg-yellow-500';
      case 'open': return 'bg-blue-500';
      case 'funded': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'submitted':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'open':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'funded':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.farmerId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.farmerId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.cropType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesApproval = approvalFilter === "all" || 
                              (approvalFilter === "approved" && project.isApproved) ||
                              (approvalFilter === "pending" && !project.isApproved);
      
      return matchesSearch && matchesStatus && matchesApproval;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "funding":
          comparison = a.currentFunding - b.currentFunding;
          break;
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
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

  const handleBulkAction = async (action: "approve" | "reject" | "close") => {
    if (selectedProjects.length === 0) return;
    
    const confirmMessage = `Are you sure you want to ${action} ${selectedProjects.length} selected projects?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading("bulk");
      
      for (const projectId of selectedProjects) {
        switch (action) {
          case "approve":
            await getAxios().patch(`/api/projects/${projectId}/approve`);
            break;
          case "reject":
            const reason = prompt("Rejection reason:");
            if (reason) await getAxios().patch(`/api/projects/${projectId}/reject`, { reason });
            break;
          case "close":
            await getAxios().patch(`/api/projects/${projectId}/close`);
            break;
        }
      }
      
      await fetchProjects();
      setSelectedProjects([]);
      setShowBulkActions(false);
      alert(`Successfully ${action}ed ${selectedProjects.length} projects!`);
    } catch (err: any) {
      console.error("Bulk action error:", err);
      let errorMessage = `Failed to ${action} projects`;
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied. Admin privileges required.";
      } else if (err.response?.data?.error) {
        errorMessage = `Failed to ${action} projects: ${err.response.data.error}`;
      } else if (err.message === "No authentication token found. Please login again.") {
        errorMessage = err.message;
      } else {
        errorMessage = `Failed to ${action} projects: ${err.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectAllProjects = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(p => p._id));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        {/* Modern Header with Glassmorphism */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl">
                <Layers className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Project Management Hub
                </h1>
                <p className="text-gray-600 text-lg">Comprehensive oversight and control center for farming investment projects</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="flex items-center gap-3 px-6 py-3 bg-white/60 hover:bg-white/80 text-gray-700 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
                <Plus className="w-5 h-5" />
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
          {[
            { 
              label: 'Total Projects', 
              value: stats.total, 
              color: 'from-blue-500 to-cyan-500', 
              icon: Target,
              change: '+12%',
              changeType: 'positive' as const,
              description: 'All projects in system'
            },
            { 
              label: 'Submitted', 
              value: stats.submitted, 
              color: 'from-yellow-500 to-orange-500', 
              icon: Clock,
              change: '+5%',
              changeType: 'positive' as const,
              description: 'Awaiting review'
            },
            { 
              label: 'Open', 
              value: stats.open, 
              color: 'from-green-500 to-emerald-500', 
              icon: Activity,
              change: '+8%',
              changeType: 'positive' as const,
              description: 'Active for funding'
            },
            { 
              label: 'Funded', 
              value: stats.funded, 
              color: 'from-purple-500 to-pink-500', 
              icon: TrendingUp,
              change: '+15%',
              changeType: 'positive' as const,
              description: 'Successfully funded'
            },
            { 
              label: 'Closed', 
              value: stats.closed, 
              color: 'from-gray-500 to-slate-600', 
              icon: Archive,
              change: '-2%',
              changeType: 'negative' as const,
              description: 'Completed projects'
            },
            { 
              label: 'Pending', 
              value: stats.pending, 
              color: 'from-red-500 to-pink-600', 
              icon: AlertTriangle,
              change: '-10%',
              changeType: 'positive' as const,
              description: 'Needs approval'
            },
            { 
              label: 'Total Funding', 
              value: formatCurrency(stats.totalFunding), 
              color: 'from-indigo-500 to-purple-600', 
              icon: DollarSign,
              change: '+25%',
              changeType: 'positive' as const,
              isAmount: true,
              description: 'Total raised amount'
            },
            { 
              label: 'Avg Funding', 
              value: formatCurrency(stats.avgFunding), 
              color: 'from-teal-500 to-cyan-600', 
              icon: BarChart3,
              change: '+18%',
              changeType: 'positive' as const,
              isAmount: true,
              description: 'Average per project'
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/90 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {stat.changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.isAmount ? stat.value : stat.value}
                </div>
                <div className="text-gray-600 text-sm font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-500 text-xs">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Controls Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, farmers, crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
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
                  className="px-4 py-3 bg-white/60 border border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <option value="all">All Approval</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white/60 border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
                >
                  <option value="date">Date</option>
                  <option value="funding">Funding</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 bg-white/60 border border-gray-200 rounded-lg text-gray-700 hover:bg-white/80 transition-all duration-300 backdrop-blur-sm"
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-white/60 border border-gray-200 rounded-xl p-1 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedProjects.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 font-medium">{selectedProjects.length} selected</span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-lg"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions Menu */}
          {showBulkActions && selectedProjects.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50/80 border border-gray-200 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Bulk Actions:</span>
                <button
                  onClick={() => handleBulkAction("approve")}
                  disabled={actionLoading === "bulk"}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction("reject")}
                  disabled={actionLoading === "bulk"}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  <XCircle className="w-4 h-4" />
                  Reject All
                </button>
                <button
                  onClick={() => handleBulkAction("close")}
                  disabled={actionLoading === "bulk"}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  <Archive className="w-4 h-4" />
                  Close All
                </button>
                <button
                  onClick={() => {
                    setSelectedProjects([]);
                    setShowBulkActions(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-gray-700 rounded-lg border border-gray-200 transition-all duration-300 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-16 text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Loading Projects</h3>
            <p className="text-gray-600 text-lg">Fetching comprehensive project data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-3xl shadow-2xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-red-600 mb-4">Error Loading Projects</h3>
            <p className="text-gray-700 mb-8 text-lg">{error}</p>
            <button 
              onClick={fetchProjects}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Search className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Projects Found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {projects.length === 0 
                ? "No projects have been submitted yet. New projects will appear here once farmers submit them." 
                : "No projects match your current search criteria. Try adjusting your filters or search terms."
              }
            </p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setApprovalFilter("all");
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            {filteredProjects.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProjects.length === filteredProjects.length}
                      onChange={selectAllProjects}
                      className="w-5 h-5 rounded border-2 border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                    <span className="text-gray-900 font-semibold text-lg">
                      Select All Projects ({filteredProjects.length} total)
                    </span>
                  </label>
                  <div className="text-gray-600 font-medium">
                    Showing {filteredProjects.length} of {projects.length} projects
                  </div>
                </div>
              </div>
            )}

            {/* Projects Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {filteredProjects.map((project) => {
                const StatusIcon = getStatusIcon(project.status);
                const isExpanded = expandedProject === project._id;
                const isActionLoading = actionLoading === project._id;
                const isSelected = selectedProjects.includes(project._id);
                
                return (
                  <div 
                    key={project._id} 
                    className={`bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group ${
                      isSelected ? 'ring-2 ring-blue-500/50 border-blue-300' : ''
                    } ${viewMode === "list" ? 'p-2' : 'overflow-hidden'}`}
                  >
                    {viewMode === "grid" ? (
                      // Compact Grid View Card
                      <div className="p-6">
                        {/* Compact Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProjectSelection(project._id)}
                              className="w-4 h-4 rounded border-2 border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(project.status)} rounded-lg flex items-center justify-center shadow-lg`}>
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(project.status)}`}>
                              {project.status.toUpperCase()}
                            </span>
                            {!project.isApproved && (
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                PENDING
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Project Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                          {project.title}
                        </h3>

                        {/* Compact Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600">Farmer:</span>
                            <span className="font-semibold text-gray-900 truncate">{project.farmerId.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Leaf className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">Crop:</span>
                            <span className="font-semibold text-gray-900">{project.cropType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-yellow-500" />
                            <span className="text-gray-600">Goal:</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(project.fundingGoal)}</span>
                          </div>
                        </div>

                        {/* Compact Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-bold text-gray-900">
                              {getFundingPercentage(project.currentFunding, project.fundingGoal).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${getFundingPercentage(project.currentFunding, project.fundingGoal)}%` 
                              }}
                            />
                          </div>
                        </div>

                        {/* Compact Action Buttons */}
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setSelectedProjectDetails(project);
                              setShowProjectModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all duration-300 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {!project.isApproved ? (
                              <>
                                <button
                                  onClick={() => handleApprove(project._id)}
                                  disabled={isActionLoading}
                                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 text-sm font-medium"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  {isActionLoading ? 'Wait...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleReject(project._id)}
                                  disabled={isActionLoading}
                                  className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 text-sm font-medium"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleClose(project._id)}
                                disabled={isActionLoading}
                                className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 text-sm font-medium"
                              >
                                <Archive className="w-4 h-4" />
                                {isActionLoading ? 'Wait...' : 'Close'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Compact List View Row
                      <div className="flex items-center gap-4 p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProjectSelection(project._id)}
                          className="w-4 h-4 rounded border-2 border-gray-300 bg-white text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                        />
                        
                        <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(project.status)} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <StatusIcon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{project.title}</h3>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(project.status)}`}>
                                {project.status.toUpperCase()}
                              </span>
                              {!project.isApproved && (
                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                  PENDING
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-600">Farmer:</span>
                              <span className="font-semibold text-gray-900 truncate">{project.farmerId.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Leaf className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">Crop:</span>
                              <span className="font-semibold text-gray-900">{project.cropType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-600">Goal:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(project.fundingGoal)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-500" />
                              <span className="text-gray-600">Created:</span>
                              <span className="font-semibold text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {/* Compact Progress Bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${getFundingPercentage(project.currentFunding, project.fundingGoal)}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-900 min-w-0">
                              {getFundingPercentage(project.currentFunding, project.fundingGoal).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedProjectDetails(project);
                              setShowProjectModal(true);
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {!project.isApproved ? (
                            <>
                              <button
                                onClick={() => handleApprove(project._id)}
                                disabled={isActionLoading}
                                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(project._id)}
                                disabled={isActionLoading}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleClose(project._id)}
                              disabled={isActionLoading}
                              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
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
          </>
        )}

        {/* Enhanced Footer */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-8 text-lg">
                <span className="text-gray-700 font-semibold">
                  Showing <span className="text-gray-900 font-bold text-xl">{filteredProjects.length}</span> of <span className="text-gray-900 font-bold text-xl">{projects.length}</span> projects
                </span>
                {selectedProjects.length > 0 && (
                  <span className="text-blue-600 font-bold text-lg">
                    {selectedProjects.length} selected
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-8">
                {[
                  { label: 'Submitted', count: stats.submitted, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
                  { label: 'Open', count: stats.open, color: 'bg-blue-500', textColor: 'text-blue-700' },
                  { label: 'Funded', count: stats.funded, color: 'bg-green-500', textColor: 'text-green-700' },
                  { label: 'Closed', count: stats.closed, color: 'bg-gray-500', textColor: 'text-gray-700' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${stat.color} rounded-full shadow-lg`}></div>
                    <span className={`font-semibold ${stat.textColor}`}>
                      {stat.label}: <span className="text-gray-900 font-bold">{stat.count}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Project Details Modal */}
        {showProjectModal && selectedProjectDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-700 p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedProjectDetails.title}</h2>
                    <p className="text-blue-100 text-lg">Comprehensive Project Overview</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProjectModal(false);
                    setSelectedProjectDetails(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors duration-300 p-2 hover:bg-white/10 rounded-xl"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
                <div className="p-8">
                  {/* Project Status and Actions Bar */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${getStatusColor(selectedProjectDetails.status)} rounded-2xl flex items-center justify-center shadow-xl`}>
                          {React.createElement(getStatusIcon(selectedProjectDetails.status), { className: "w-10 h-10 text-white" })}
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className={`px-6 py-2 rounded-full text-lg font-bold shadow-lg ${getStatusBadge(selectedProjectDetails.status)}`}>
                              {selectedProjectDetails.status.toUpperCase()}
                            </span>
                            {!selectedProjectDetails.isApproved && (
                              <span className="px-6 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-lg">
                                PENDING APPROVAL
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-lg">Project ID: #{selectedProjectDetails._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {!selectedProjectDetails.isApproved ? (
                          <>
                            <button
                              onClick={() => handleApprove(selectedProjectDetails._id)}
                              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <CheckCircle2 className="w-6 h-6" />
                              Approve Project
                            </button>
                            <button
                              onClick={() => handleReject(selectedProjectDetails._id)}
                              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <XCircle className="w-6 h-6" />
                              Reject Project
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleClose(selectedProjectDetails._id)}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white rounded-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Archive className="w-6 h-6" />
                            Close Project
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column - Project Information */}
                    <div className="xl:col-span-2 space-y-8">
                      {/* Project Description */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <FileText className="w-7 h-7 text-blue-600" />
                          Project Description
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{selectedProjectDetails.description}</p>
                        </div>
                      </div>

                      {/* Additional Project Information */}
                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <Info className="w-7 h-7 text-cyan-600" />
                          Additional Project Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-cyan-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                                <Hash className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-sm text-cyan-600 font-semibold uppercase tracking-wide">Project Slug</div>
                                <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.slug}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-cyan-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-sm text-cyan-600 font-semibold uppercase tracking-wide">Last Updated</div>
                                <div className="text-lg font-bold text-gray-900">{formatDate(selectedProjectDetails.updatedAt)}</div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedProjectDetails.verificationStatus && (
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-cyan-200 md:col-span-2">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                                  <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-cyan-600 font-semibold uppercase tracking-wide">Overall Verification Status</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.verificationStatus}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedProjectDetails.rejectionReason && (
                            <div className="bg-red-50 rounded-xl p-6 shadow-lg border border-red-200 md:col-span-2">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                                  <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-red-600 font-semibold uppercase tracking-wide">Previous Rejection Reason</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.rejectionReason}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Admin Notes Section */}
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <MessageSquare className="w-7 h-7 text-gray-600" />
                          Admin Notes & Comments
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                          {selectedProjectDetails.adminNotes ? (
                            <div className="mb-4">
                              <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">Existing Notes</div>
                              <div className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{selectedProjectDetails.adminNotes}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic mb-4">No admin notes available for this project.</div>
                          )}
                          
                          <div>
                            <label className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2 block">Add New Note</label>
                            <textarea 
                              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              rows={4}
                              placeholder="Add notes about this project for future reference..."
                            />
                            <button className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300">
                              Save Note
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Funding Information */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <DollarSign className="w-7 h-7 text-green-600" />
                          Funding Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                            <div className="text-sm text-green-600 font-semibold uppercase tracking-wide mb-2">Funding Goal</div>
                            <div className="text-3xl font-bold text-gray-900">{formatCurrency(selectedProjectDetails.fundingGoal)}</div>
                          </div>
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                            <div className="text-sm text-green-600 font-semibold uppercase tracking-wide mb-2">Current Funding</div>
                            <div className="text-3xl font-bold text-gray-900">{formatCurrency(selectedProjectDetails.currentFunding)}</div>
                          </div>
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                            <div className="text-sm text-green-600 font-semibold uppercase tracking-wide mb-2">Progress</div>
                            <div className="text-3xl font-bold text-gray-900">{getFundingPercentage(selectedProjectDetails.currentFunding, selectedProjectDetails.fundingGoal).toFixed(1)}%</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-700 font-semibold text-lg">Funding Progress</span>
                            <span className="text-gray-600">
                              {formatCurrency(selectedProjectDetails.currentFunding)} / {formatCurrency(selectedProjectDetails.fundingGoal)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 h-6 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                              style={{ 
                                width: `${getFundingPercentage(selectedProjectDetails.currentFunding, selectedProjectDetails.fundingGoal)}%` 
                              }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Metrics */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <BarChart3 className="w-7 h-7 text-purple-600" />
                          Project Metrics & Timeline
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200 text-center">
                            <Leaf className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <div className="text-sm text-purple-600 font-semibold uppercase tracking-wide mb-2">Expected Yield</div>
                            <div className="text-2xl font-bold text-gray-900">{selectedProjectDetails.expectedYield}</div>
                            <div className="text-sm text-gray-600">tons</div>
                          </div>
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200 text-center">
                            <Percent className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                            <div className="text-sm text-purple-600 font-semibold uppercase tracking-wide mb-2">Expected ROI</div>
                            <div className="text-2xl font-bold text-gray-900">{selectedProjectDetails.expectedROI}%</div>
                            <div className="text-sm text-gray-600">return</div>
                          </div>
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200 text-center">
                            <Timer className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                            <div className="text-sm text-purple-600 font-semibold uppercase tracking-wide mb-2">Duration</div>
                            <div className="text-2xl font-bold text-gray-900">{selectedProjectDetails.projectDuration}</div>
                            <div className="text-sm text-gray-600">months</div>
                          </div>
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200 text-center">
                            <CalendarIcon className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                            <div className="text-sm text-purple-600 font-semibold uppercase tracking-wide mb-2">Created</div>
                            <div className="text-lg font-bold text-gray-900">{formatDate(selectedProjectDetails.createdAt)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Farmer Identity Details */}
                      {(selectedProjectDetails.farmerVerification || selectedProjectDetails.farmerIdentity) && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-indigo-600" />
                            Farmer Identity Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
                                  <Hash className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Aadhaar Number</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {(selectedProjectDetails.farmerVerification?.aadhaarNumber || selectedProjectDetails.farmerIdentity?.aadhaarNumber) || 'Not provided'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Government ID Type</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {(selectedProjectDetails.farmerVerification?.govtIdType || selectedProjectDetails.farmerIdentity?.govtIdType) || 'Not provided'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-200 md:col-span-2">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                  <Hash className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Government ID Number</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {(selectedProjectDetails.farmerVerification?.govtIdNumber || selectedProjectDetails.farmerIdentity?.govtIdNumber) || 'Not provided'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Aadhaar Document */}
                            {selectedProjectDetails.farmerVerification?.aadhaarDocument && (
                              <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-200">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Aadhaar Document</div>
                                    <button 
                                      onClick={() => window.open(`http://localhost:5000/uploads/${selectedProjectDetails.farmerVerification?.aadhaarDocument}`, '_blank')}
                                      className="text-blue-600 hover:text-blue-800 font-semibold underline"
                                    >
                                      View Document
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Government ID Document */}
                            {selectedProjectDetails.farmerVerification?.govtIdDocument && (
                              <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-200">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">Government ID Document</div>
                                    <button 
                                      onClick={() => window.open(`http://localhost:5000/uploads/${selectedProjectDetails.farmerVerification?.govtIdDocument}`, '_blank')}
                                      className="text-blue-600 hover:text-blue-800 font-semibold underline"
                                    >
                                      View Document
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Land Ownership Details */}
                      {selectedProjectDetails.landOwnership && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <FileCheck className="w-7 h-7 text-emerald-600" />
                            Land Ownership Documentation
                          </h3>
                          
                          {/* Ownership Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">Ownership Type</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landOwnership.ownershipType || 'Not provided'}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">Owner Name</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landOwnership.ownerName || 'Not provided'}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">Relation to Owner</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landOwnership.relationToOwner || 'Not provided'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Ownership Documents */}
                          {selectedProjectDetails.landOwnership.documents && selectedProjectDetails.landOwnership.documents.length > 0 && (
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                Ownership Documents ({selectedProjectDetails.landOwnership.documents.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedProjectDetails.landOwnership.documents.map((doc, index) => (
                                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200">
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">{doc.type}</div>
                                        <div className="text-lg font-bold text-gray-900">Doc #{doc.documentNumber}</div>
                                        <div className="text-sm text-gray-500">
                                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => window.open(`http://localhost:5000/uploads/${doc.filePath}`, '_blank')}
                                        className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View Document
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = `http://localhost:5000/uploads/${doc.filePath}`;
                                          link.download = `${doc.type}_${doc.documentNumber}`;
                                          link.click();
                                        }}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Complete Land Details */}
                      {selectedProjectDetails.landDetails && (
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <MapPin className="w-7 h-7 text-orange-600" />
                            Complete Land Information
                          </h3>
                          
                          {/* Address Section */}
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200 mb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Address Details</h4>
                            <div className="text-lg font-bold text-gray-900 mb-4">
                              {formatAddress(selectedProjectDetails.landDetails.address)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-orange-600 font-semibold">State:</span>
                                <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.state || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-orange-600 font-semibold">District:</span>
                                <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.district}</span>
                              </div>
                              <div>
                                <span className="text-orange-600 font-semibold">Tehsil:</span>
                                <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.tehsil || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-orange-600 font-semibold">Village:</span>
                                <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.village}</span>
                              </div>
                              <div>
                                <span className="text-orange-600 font-semibold">Panchayat:</span>
                                <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.panchayat}</span>
                              </div>
                              {selectedProjectDetails.landDetails.municipality && (
                                <div>
                                  <span className="text-orange-600 font-semibold">Municipality:</span>
                                  <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.municipality}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Land Specifications */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                  <Hash className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Survey Number</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landDetails.surveyNumber || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                            
                            {selectedProjectDetails.landDetails.subDivisionNumber && (
                              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <Hash className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Sub Division</div>
                                    <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landDetails.subDivisionNumber}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                  <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Land Area</div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {selectedProjectDetails.landDetails.landArea ? 
                                      `${selectedProjectDetails.landDetails.landArea.value} ${selectedProjectDetails.landDetails.landArea.unit}` : 
                                      'N/A'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                  <Leaf className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Land Type</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landDetails.landType || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                            
                            {selectedProjectDetails.landDetails.soilType && (
                              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                                    <Leaf className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Soil Type</div>
                                    <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landDetails.soilType}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {selectedProjectDetails.landDetails.irrigationSource && (
                              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-orange-600 font-semibold uppercase tracking-wide">Irrigation Source</div>
                                    <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landDetails.irrigationSource}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* GPS Coordinates */}
                          {selectedProjectDetails.landDetails.coordinates && (
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200">
                              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-orange-600" />
                                GPS Coordinates
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="text-orange-600 font-semibold">Latitude:</span>
                                  <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.coordinates.latitude}</span>
                                </div>
                                <div>
                                  <span className="text-orange-600 font-semibold">Longitude:</span>
                                  <span className="ml-2 text-gray-900 font-medium">{selectedProjectDetails.landDetails.coordinates.longitude}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps?q=${selectedProjectDetails.landDetails?.coordinates.latitude},${selectedProjectDetails.landDetails?.coordinates.longitude}`, '_blank')}
                                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2"
                              >
                                <MapPin className="w-4 h-4" />
                                View on Google Maps
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Farmer & Verification Details */}
                    <div className="space-y-8">
                      {/* Farmer Information */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <User className="w-7 h-7 text-blue-600" />
                          Farmer Information
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Full Name</div>
                                <div className="text-xl font-bold text-gray-900">{selectedProjectDetails.farmerId.name}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                                <Mail className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Email Address</div>
                                <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.farmerId.email}</div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedProjectDetails.farmerId.phone && (
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                                  <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Phone Number</div>
                                  <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.farmerId.phone}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Land Details */}
                      {selectedProjectDetails.landDetails && (
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <MapPin className="w-7 h-7 text-green-600" />
                            Land Information
                          </h3>
                          <div className="space-y-4">
                            {[
                              { label: 'District', value: selectedProjectDetails.landDetails.district, icon: Building },
                              { label: 'Village', value: selectedProjectDetails.landDetails.village, icon: MapIcon },
                              { label: 'Panchayat', value: selectedProjectDetails.landDetails.panchayat, icon: Users },
                              { label: 'Total Area', value: `${selectedProjectDetails.landDetails.area} acres`, icon: Target },
                              { label: 'Soil Type', value: selectedProjectDetails.landDetails.soilType, icon: Leaf },
                            ].map((item, index) => {
                              const IconComponent = item.icon;
                              return (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                        <IconComponent className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm text-green-600 font-semibold uppercase tracking-wide">{item.label}</div>
                                        <div className="text-lg font-bold text-gray-900">{item.value}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Verification Status */}
                      {selectedProjectDetails.farmerIdentity && (
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Shield className="w-7 h-7 text-yellow-600" />
                            Verification Status
                          </h3>
                          <div className="space-y-4">
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-yellow-600 font-semibold uppercase tracking-wide">Identity Verification</div>
                                    <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.farmerIdentity.verificationStatus}</div>
                                  </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                  selectedProjectDetails.farmerIdentity.verificationStatus === 'verified' 
                                    ? 'bg-green-100 text-green-700 border border-green-300' 
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                }`}>
                                  {selectedProjectDetails.farmerIdentity.verificationStatus.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            {selectedProjectDetails.landOwnership && (
                              <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                      <FileCheck className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <div className="text-sm text-yellow-600 font-semibold uppercase tracking-wide">Land Ownership</div>
                                      <div className="text-lg font-bold text-gray-900">{selectedProjectDetails.landOwnership.verificationStatus}</div>
                                    </div>
                                  </div>
                                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    selectedProjectDetails.landOwnership.verificationStatus === 'verified' 
                                      ? 'bg-green-100 text-green-700 border border-green-300' 
                                      : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                  }`}>
                                    {selectedProjectDetails.landOwnership.verificationStatus.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Comprehensive Media Gallery */}
                      {(selectedProjectDetails.landMedia?.photos?.length || selectedProjectDetails.landMedia?.videos?.length || 
                        selectedProjectDetails.landPhotos?.length || selectedProjectDetails.landVideos?.length || selectedProjectDetails.ownershipDocuments?.length) && (
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Image className="w-7 h-7 text-pink-600" />
                            Submitted Media & Documents
                          </h3>
                          
                          {/* Land Photos Gallery */}
                          {(selectedProjectDetails.landMedia?.photos?.length || selectedProjectDetails.landPhotos?.length) && (
                            <div className="mb-8">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <Camera className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">
                                  Land Photos ({(selectedProjectDetails.landMedia?.photos?.length || selectedProjectDetails.landPhotos?.length || 0)})
                                </h4>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(selectedProjectDetails.landMedia?.photos || selectedProjectDetails.landPhotos || []).map((photo, index) => (
                                  <div key={index} className="bg-white rounded-xl p-3 shadow-lg border border-pink-200 group hover:shadow-xl transition-all duration-300">
                                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                      <img 
                                        src={`http://localhost:5000/uploads/${photo.filePath || photo.filename}`}
                                        alt={`Land photo ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOUI5QkEwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIHN0cm9rZT0iIzlCOUJBMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LXNpemU9IjEyIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      <div className="font-semibold truncate">{photo.description || `Photo ${index + 1}`}</div>
                                      {photo.geoTag && (
                                        <div className="text-green-600 font-medium">📍 Geo-tagged</div>
                                      )}
                                      <div className="text-gray-500">
                                        {new Date(photo.uploadedAt || photo.uploadDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => window.open(`http://localhost:5000/uploads/${photo.filePath || photo.filename}`, '_blank')}
                                      className="w-full mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors duration-300"
                                    >
                                      View Full Size
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Land Videos */}
                          {(selectedProjectDetails.landMedia?.videos?.length || selectedProjectDetails.landVideos?.length) && (
                            <div className="mb-8">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                  <PlayCircle className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">
                                  Land Videos ({(selectedProjectDetails.landMedia?.videos?.length || selectedProjectDetails.landVideos?.length || 0)})
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(selectedProjectDetails.landMedia?.videos || selectedProjectDetails.landVideos || []).map((video, index) => (
                                  <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-pink-200">
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                                      <video 
                                        src={`http://localhost:5000/uploads/${video.filePath || video.filename}`}
                                        className="w-full h-full object-cover"
                                        controls
                                        preload="metadata"
                                      />
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <div className="font-semibold truncate">{video.description || `Video ${index + 1}`}</div>
                                      {video.duration && (
                                        <div className="text-gray-500">Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</div>
                                      )}
                                      {video.geoTag && (
                                        <div className="text-green-600 font-medium">📍 Geo-tagged</div>
                                      )}
                                      <div className="text-gray-500">
                                        {new Date(video.uploadedAt || video.uploadDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => window.open(`http://localhost:5000/uploads/${video.filePath || video.filename}`, '_blank')}
                                      className="w-full mt-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors duration-300"
                                    >
                                      Download Video
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Risk Factors */}
                      {selectedProjectDetails.riskFactors && selectedProjectDetails.riskFactors.length > 0 && (
                        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100">
                          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                            Risk Assessment
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedProjectDetails.riskFactors.map((risk, index) => (
                              <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-red-200 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span className="text-gray-800 font-medium">{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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