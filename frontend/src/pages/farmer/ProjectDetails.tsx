// src/pages/farmer/projects/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaArrowLeft, FaSave, FaTimes, FaRupeeSign } from "react-icons/fa";

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
        const res = await axios.get(`http://localhost:5000/api/projects/projects/${id}`);
        setProject(res.data);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          fundingGoal: res.data.fundingGoal,
          status: res.data.status,
        });
      } catch (err) {
        setError("Failed to load project.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Delete project
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/projects/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/farmer/projects");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete project.");
    }
  };

  // Save edits
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/projects/projects/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(res.data);
      setEditing(false);
      alert("Project updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update project.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading project details...</div>
      </div>
    );

  if (error || !project)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500 text-lg font-medium mb-4">{error || "Project not found"}</p>
        <button 
          onClick={() => navigate("/farmer/projects")}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Projects
        </button>
      </div>
    );

  const isOwner = project.farmerId?._id === currentUser.id;
  const canEditOrDelete = isOwner || currentUser.role === "farmer";
  const progressPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/farmer/projects")}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back to Projects
          </button>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
          {editing ? (
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h1>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Project Title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Project Description"
                    rows={5}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funding Goal (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRupeeSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.fundingGoal}
                      onChange={(e) => setFormData({ ...formData, fundingGoal: Number(e.target.value) })}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Funding Goal"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="open">Open</option>
                    <option value="completed">Completed</option>
                    <option value="funded">Funded</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    <FaSave className="mr-2" /> Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-sm hover:bg-gray-300 transition-colors"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h1>
                <p className="text-gray-600">{project.description}</p>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                    <span className="text-sm font-medium text-blue-600">{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-blue-600">{formatCurrency(project.currentFunding)}</span>
                    <span className="text-gray-500">of {formatCurrency(project.fundingGoal)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <p className="font-medium text-gray-800 capitalize">{project.status}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Created By</p>
                    <p className="font-medium text-gray-800">{project.farmerId?.name}</p>
                    <p className="text-sm text-gray-600">{project.farmerId?.email}</p>
                  </div>
                </div>
              </div>

              {canEditOrDelete && (
                <div className="p-6 bg-gray-50">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center px-5 py-2.5 bg-white border border-blue-600 text-blue-600 font-medium rounded-sm hover:bg-blue-50 transition-colors"
                    >
                      <FaEdit className="mr-2" /> Edit Project
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center px-5 py-2.5 bg-red-600 text-white font-medium rounded-sm hover:bg-red-700 transition-colors"
                    >
                      <FaTrashAlt className="mr-2" /> Delete Project
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