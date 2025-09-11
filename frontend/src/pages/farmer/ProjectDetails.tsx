// src/pages/farmer/projects/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaArrowLeft, FaSave, FaTimes } from "react-icons/fa";

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
        <p className="text-lg text-gray-600">Loading project...⏳</p>
      </div>
    );

  if (error || !project)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600 text-lg font-semibold">{error || "Project not found"}</p>
        <Link to="/farmer/projects" className="mt-4 text-green-600 underline hover:text-green-800 transition-colors">
          Back to Projects
        </Link>
      </div>
    );

  const isOwner = project.farmerId?._id === currentUser.id;
  const canEditOrDelete = isOwner || currentUser.role === "farmer";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium text-lg"
          >
            <FaArrowLeft className="mr-2 text-xl" /> <span className="hidden sm:inline">Back to Projects</span>
          </button>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          {editing ? (
            <div className="space-y-6">
              <h1 className="text-3xl font-extrabold text-gray-800">Edit Project</h1>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Project Title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Project Description"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Funding Goal (INR)</label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, fundingGoal: Number(e.target.value) })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Funding Goal"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="submitted">Submitted</option>
                  <option value="open">Open</option>
                  <option value="completed">Completed</option>
                  <option value="funded">Funded</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row-reverse justify-start gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
                >
                  <FaSave className="mr-2" /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
                >
                  <FaTimes className="mr-2" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600 mb-6 text-lg">{project.description}</p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-500">Progress</p>
                  <div className="flex justify-between items-baseline mb-2 mt-1">
                    <span className="text-green-600 font-bold text-2xl">
                      {formatCurrency(project.currentFunding)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      Goal: <span className="font-semibold">{formatCurrency(project.fundingGoal)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                      style={{
                        width: `${Math.min(
                          (project.currentFunding / project.fundingGoal) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Status</p>
                    <p className="font-medium text-gray-800">{project.status}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Created By</p>
                    <p className="font-medium text-gray-800">{project.farmerId?.name}</p>
                    <p className="text-xs text-gray-500">{project.farmerId?.email}</p>
                  </div>
                </div>
              </div>

              {canEditOrDelete && (
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
                  >
                    <FaEdit className="mr-2" /> Edit Project
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-all transform hover:scale-105"
                  >
                    <FaTrashAlt className="mr-2" /> Delete Project
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}