// src/pages/farmer/projects/ViewProjects.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

// Replace with your auth context or pass as props
const currentUser = {
  id: localStorage.getItem("userId") || "",
  role: localStorage.getItem("role") || "",
};
const token = localStorage.getItem("token") || "";

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ViewProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch projects
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

  // Delete project
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

  // Edit project
  const handleEdit = (id: string) => {
    navigate(`/farmer/projects/edit/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "text-blue-600 bg-blue-50";
      case "open":
        return "text-green-600 bg-green-50";
      case "completed":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <svg
          className="animate-spin h-12 w-12 text-green-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading your projects...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-lg text-center">
          <p className="text-xl font-semibold text-red-600">Error</p>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );

  if (projects.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-12 rounded-xl shadow-lg text-center border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Projects Found</h2>
          <p className="text-gray-600 max-w-sm mx-auto">
            It looks like you haven't created any projects yet. Start a new one to get
            started.
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-10 text-center sm:text-left tracking-tight">
        Your Projects
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => {
          // Add a null/undefined check for the project object
          if (!project) return null;

          const isOwner = project.createdBy?._id === currentUser.id;
          const canEditOrDelete = isOwner || currentUser.role === "admin";

          return (
            <div key={project._id} className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
              <div className="p-6 flex-grow">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{project.title}</h2>
                <div
                  className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusText(project.status)}
                </div>
                <p className="text-gray-600 text-sm mt-4 flex-grow">
                  {project.description.substring(0, 120)}
                  {project.description.length > 120 ? "..." : ""}
                </p>
              </div>

              <div className="px-6 pt-4 pb-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                  <span className="text-lg font-bold text-green-700">{formatCurrency(project.currentFunding)}</span>
                  <span className="text-base text-gray-400"> / {formatCurrency(project.fundingGoal)}</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((project.currentFunding / project.fundingGoal) * 100, 100)}%` }}
                  ></div>
                </div>

                {canEditOrDelete && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(project._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}