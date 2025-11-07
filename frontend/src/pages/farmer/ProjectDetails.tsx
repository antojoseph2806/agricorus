// src/pages/farmer/projects/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaArrowLeft, FaSave, FaTimes, FaRupeeSign, FaChartLine, FaUser, FaRocket, FaDatabase } from "react-icons/fa";

interface Project {
  _id: string;
  slug: string;
  title: string;
  description: string;
  currentFunding: number;
  fundingGoal: number;
  status: string;
  farmerId: { _id: string; name: string; email: string };
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

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fundingGoal: 0,
    status: "",
  });

  // Fetch project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://agricorus.onrender.com/api/projects/projects/${id}`);
        setProject(res.data);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          fundingGoal: res.data.fundingGoal,
          status: res.data.status,
        });
      } catch (err) {
        setError("Failed to load project deployment.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Delete project
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this deployment?")) return;

    try {
      await axios.delete(`https://agricorus.onrender.com/api/projects/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/farmer/projects");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete deployment.");
    }
  };

  // Save edits
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `https://agricorus.onrender.com/api/projects/projects/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(res.data);
      setEditing(false);
      alert("Deployment updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update deployment.");
    }
  };

  if (loading)
    return (
      <div 
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-white text-xl font-semibold tracking-wider">LOADING DEPLOYMENT...</h3>
          <p className="text-gray-300 mt-2">Initializing project details</p>
        </div>
      </div>
    );

  if (error || !project)
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md text-center border border-white/20">
          <div className="text-6xl mb-4">🚨</div>
          <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">DEPLOYMENT ERROR</h3>
          <p className="text-gray-200 mb-6">{error || "Deployment not found"}</p>
          <button 
            onClick={() => navigate("/farmer/projects")}
            className="flex items-center justify-center text-white hover:text-[#ff3b3b] font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Deployments
          </button>
        </div>
      </div>
    );

  const isOwner = project.farmerId?._id === currentUser.id;
  const canEditOrDelete = isOwner || currentUser.role === "farmer";
  const progressPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);

  const getStatusColors = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted": 
        return "text-blue-400 bg-blue-500/20 border border-blue-400/30";
      case "open": 
        return "text-green-400 bg-green-500/20 border border-green-400/30";
      case "completed": 
        return "text-purple-400 bg-purple-500/20 border border-purple-400/30";
      case "funded": 
        return "text-yellow-400 bg-yellow-500/20 border border-yellow-400/30";
      default: 
        return "text-gray-400 bg-gray-500/20 border border-gray-400/30";
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] p-4 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/farmer/projects")}
            className="flex items-center text-white/80 hover:text-white font-bold uppercase tracking-wide transition-all duration-300 hover:scale-105 group"
          >
            <FaArrowLeft className="mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
              Deployment Details
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full mx-auto"></div>
          </div>
          
          <div className="w-24"></div> {/* Spacer for balance */}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          {editing ? (
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-3">
                  <FaEdit className="text-white text-sm" />
                </div>
                <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Edit Deployment</h1>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide mb-2">Deployment Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 transition-all duration-300"
                    placeholder="Enter deployment title"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 resize-none transition-all duration-300"
                    placeholder="Describe your deployment"
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide mb-2">Funding Target</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaRupeeSign className="text-gray-400 group-focus-within:text-[#ff3b3b] transition-colors duration-300" />
                      </div>
                      <input
                        type="number"
                        value={formData.fundingGoal}
                        onChange={(e) => setFormData({ ...formData, fundingGoal: Number(e.target.value) })}
                        className="w-full pl-12 p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white placeholder-gray-400 transition-all duration-300"
                        placeholder="Target amount"
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide mb-2">Deployment Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/30 text-white transition-all duration-300"
                    >
                      <option value="submitted" className="bg-[#1a2a88]">Submitted</option>
                      <option value="open" className="bg-[#1a2a88]">Open</option>
                      <option value="completed" className="bg-[#1a2a88]">Completed</option>
                      <option value="funded" className="bg-[#1a2a88]">Funded</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#ff3b3b]/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 border border-[#ff3b3b]/20"
                  >
                    <FaSave className="mr-3" />
                    UPDATE DEPLOYMENT
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FaTimes className="mr-3" />
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="p-8 border-b border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-white uppercase tracking-wide mb-4 leading-tight">
                      {project.title}
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div className={`inline-flex items-center rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wide ${getStatusColors(project.status)}`}>
                    {project.status}
                  </div>
                </div>
              </div>
              
              {/* Progress Section */}
              <div className="p-8 border-b border-white/10">
                <div className="flex items-center mb-6">
                  <FaChartLine className="text-[#ff3b3b] text-xl mr-3" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wide">Funding Progress</h2>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">Deployment Progress</span>
                    <span className="text-sm font-bold text-[#ff3b3b] font-mono">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-white font-mono">{formatCurrency(project.currentFunding)}</span>
                    <span className="text-gray-300 font-mono">Target: {formatCurrency(project.fundingGoal)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-[1.02]">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 border border-blue-400/30">
                        <FaDatabase className="text-blue-400 text-lg" />
                      </div>
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Deployment Status</p>
                    </div>
                    <p className="font-bold text-white text-lg capitalize">{project.status}</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-[1.02]">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 border border-green-400/30">
                        <FaUser className="text-green-400 text-lg" />
                      </div>
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-wide">Deployment Owner</p>
                    </div>
                    <p className="font-bold text-white text-lg">{project.farmerId?.name}</p>
                    <p className="text-gray-300 text-sm">{project.farmerId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canEditOrDelete && (
                <div className="p-8 bg-white/5">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
                    >
                      <FaEdit className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      EDIT DEPLOYMENT
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#ff3b3b]/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 border border-[#ff3b3b]/20"
                    >
                      <FaTrashAlt className="mr-3" />
                      DELETE DEPLOYMENT
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}