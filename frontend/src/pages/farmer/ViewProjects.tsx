// src/pages/farmer/projects/ViewProjects.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaPlus, FaSearch } from "react-icons/fa";

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
      case "submitted": return "text-blue-600 bg-blue-50";
      case "open": return "text-green-600 bg-green-50";
      case "completed": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading projects...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
            <p className="text-gray-600 mt-1">Manage your agricultural projects</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            
            <button
              onClick={() => navigate("/farmer/projects/add")}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm font-medium transition-colors"
            >
              <FaPlus className="mr-2" />
              New Project
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-sm shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4 text-6xl">📋</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              {searchQuery ? "No projects found" : "No Projects Yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Get started by creating your first project"
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/farmer/projects/add")}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-sm font-medium transition-colors"
              >
                <FaPlus className="mr-2" />
                Create New Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const isOwner = project.createdBy?._id === currentUser.id;
              const canEditOrDelete = isOwner || currentUser.role === "admin";
              const progressPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);

              return (
                <div
                  key={project._id}
                  className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-lg font-semibold text-gray-800 line-clamp-2" style={{ minHeight: '56px' }}>
                        {project.title}
                      </h2>
                      <span className={`inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium ${getStatusColors(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-gray-700">Raised:</span>
                        <span className="text-sm text-gray-500">{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-blue-600">{formatCurrency(project.currentFunding)}</span>
                        <span className="text-gray-500">of {formatCurrency(project.fundingGoal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleView(project._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                      
                      {canEditOrDelete && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(project._id); }}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit project"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete project"
                          >
                            <FaTrashAlt />
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
      </div>
    </div>
  );
}