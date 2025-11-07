// src/pages/farmer/projects/ViewProjects.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaPlus, FaSearch, FaRocket, FaChartLine, FaDatabase } from "react-icons/fa";

interface Project {
  _id: string;
  slug: string;
  title: string;
  description: string;
  currentFunding: number;
  fundingGoal: number;
  status: string;
  createdBy: { _id: string; name: string; email: string };
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

export default function ViewProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/projects/projects");
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
    if (searchQuery) {
      const filtered = projects.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

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
      case "submitted": 
        return "text-blue-400 bg-blue-500/20 border border-blue-400/30";
      case "open": 
        return "text-green-400 bg-green-500/20 border border-green-400/30";
      case "completed": 
        return "text-purple-400 bg-purple-500/20 border border-purple-400/30";
      default: 
        return "text-gray-400 bg-gray-500/20 border border-gray-400/30";
    }
  };

  const getStatusText = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (loading)
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-white text-xl font-semibold tracking-wider">LOADING PROJECTS...</h3>
          <p className="text-gray-300 mt-2">Initializing your project dashboard</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md text-center border border-white/20">
          <div className="text-6xl mb-4">🚨</div>
          <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">SYSTEM ALERT</h3>
          <p className="text-gray-200">{error}</p>
        </div>
      </div>
    );

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] p-4 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                <FaDatabase className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
                PROJECT DASHBOARD
              </h1>
            </div>
            <p className="text-gray-300 text-lg font-light">
              Manage and monitor your agricultural initiatives
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-[#ff3b3b] transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search deployments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 w-full transition-all duration-300"
              />
            </div>
            
            <button
              onClick={() => navigate("/farmer/projects/add")}
              className="flex items-center justify-center bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#ff3b3b]/30 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 border border-[#ff3b3b]/20"
            >
              <FaRocket className="mr-2 text-sm" />
              NEW DEPLOYMENT
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <div className="text-4xl">📋</div>
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-3">
              {searchQuery ? "NO DEPLOYMENTS FOUND" : "NO ACTIVE DEPLOYMENTS"}
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              {searchQuery 
                ? "Adjust your search parameters and try again" 
                : "Launch your first agricultural initiative to get started"
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/farmer/projects/add")}
                className="flex items-center justify-center bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#ff3b3b]/30 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 border border-[#ff3b3b]/20"
              >
                <FaRocket className="mr-3" />
                INITIATE DEPLOYMENT
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isOwner = project.createdBy?._id === currentUser.id;
              const canEditOrDelete = isOwner || currentUser.role === "admin";
              const progressPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);

              return (
                <div
                  key={project._id}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col shadow-lg"
                >
                  <div className="p-6 flex-grow">
                    {/* Header with Status */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold text-white tracking-wide line-clamp-2 flex-grow mr-3" style={{ minHeight: '64px' }}>
                        {project.title}
                      </h2>
                      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusColors(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="mt-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm font-semibold text-white uppercase tracking-wide">Funding Progress</span>
                        <span className="text-sm text-gray-300 font-mono">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 mb-3">
                        <div
                          className="bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-white font-mono">{formatCurrency(project.currentFunding)}</span>
                        <span className="text-gray-300 font-mono">Target: {formatCurrency(project.fundingGoal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleView(project._id)}
                        className="text-white hover:text-[#ff3b3b] text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 group/view"
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
                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-110"
                            title="Edit deployment"
                          >
                            <FaEdit className="text-lg" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                            className="p-2 text-gray-300 hover:text-[#ff3b3b] hover:bg-red-500/10 rounded-xl transition-all duration-300 transform hover:scale-110"
                            title="Delete deployment"
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
            <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
              <span className="text-gray-300 text-sm font-medium uppercase tracking-wide">
                Displaying <span className="text-white font-bold">{filteredProjects.length}</span> of <span className="text-white font-bold">{projects.length}</span> Active Deployments
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}