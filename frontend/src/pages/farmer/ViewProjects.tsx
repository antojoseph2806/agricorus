// src/pages/farmer/projects/ViewProjects.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/projects/projects");
        if (Array.isArray(res.data)) {
          setProjects(res.data);
        } else {
          setError("The API did not return an array of projects.");
          setProjects([]);
        }
      } catch (err) {
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

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
      case "submitted": return "text-blue-700 bg-blue-100";
      case "open": return "text-green-700 bg-green-100";
      case "completed": return "text-purple-700 bg-purple-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const getStatusText = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading projects...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );

  if (projects.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>No Projects Found</h2>
        <button
          onClick={() => navigate("/farmer/projects/add")}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Create New Project
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const isOwner = project.createdBy?._id === currentUser.id;
        const canEditOrDelete = isOwner || currentUser.role === "admin";

        return (
          <div
            key={project._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
            onClick={() => handleView(project._id)}
          >
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColors(project.status)}`}>
                {getStatusText(project.status)}
              </div>
              <p className="text-gray-600 text-sm mt-4">
                {project.description.substring(0, 150)}
                {project.description.length > 150 ? "..." : ""}
              </p>
            </div>

            <div className="px-6 pt-4 pb-6 border-t border-gray-100">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-lg font-bold text-green-700">{formatCurrency(project.currentFunding)}</span>
                <span className="text-sm text-gray-500">/ {formatCurrency(project.fundingGoal)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min((project.currentFunding / project.fundingGoal) * 100, 100)}%` }}
                ></div>
              </div>

              {canEditOrDelete && (
                <div className="mt-5 flex space-x-3 justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(project._id); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaEdit className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                  >
                    <FaTrashAlt className="mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
