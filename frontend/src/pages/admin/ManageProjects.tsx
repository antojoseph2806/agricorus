// src/pages/admin/ManageProjects.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Check, X, DollarSign, Eye } from "lucide-react";
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
}

const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <p className="text-red-500 text-center text-lg font-medium">
            You must be logged in as admin to view this page.
          </p>
        </div>
      </div>
    );
  }

  const getAxios = () =>
    axios.create({
      baseURL: "http://localhost:5000",
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
      await getAxios().patch(`/api/projects/${id}/approve`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to approve project");
    }
  };

  const handleClose = async (id: string) => {
    if (!confirmAction("Are you sure you want to close this project?")) return;
    try {
      await getAxios().patch(`/api/projects/${id}/close`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to close project");
    }
  };

  const handleMarkFunded = async (id: string) => {
    if (!confirmAction("Mark this project as funded?")) return;
    try {
      await getAxios().patch(`/api/projects/${id}/mark-funded`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to mark project funded");
    }
  };

  const handleEdit = (projectId: string) => {
    alert("Update feature to implement");
  };

  const handleView = (projectId: string) => {
    // Navigate to project detail page
    window.open(`/project/${projectId}`, '_blank');
  };

  const getFundingPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Projects</h1>
            <p className="text-gray-600">Review and manage all farming projects</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500 text-lg">No projects found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {project.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status.toUpperCase()}
                          </span>
                          {!project.isApproved && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              PENDING APPROVAL
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Farmer:</span>
                            {project.farmerId.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Email:</span>
                            {project.farmerId.email}
                          </span>
                        </div>

                        {/* Funding Progress Bar - Flipkart Style */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Funding Progress</span>
                            <span className="font-semibold">
                              ₹{project.currentFunding.toLocaleString()} / ₹{project.fundingGoal.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${getFundingPercentage(project.currentFunding, project.fundingGoal)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="text-right text-xs text-gray-500 mt-1">
                            {getFundingPercentage(project.currentFunding, project.fundingGoal).toFixed(1)}% funded
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-col">
                        <button
                          onClick={() => handleView(project._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(project._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors font-medium"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        {!project.isApproved && (
                          <button
                            onClick={() => handleApprove(project._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium"
                          >
                            <Check size={16} />
                            Approve
                          </button>
                        )}
                        {project.status !== "closed" && (
                          <button
                            onClick={() => handleClose(project._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                          >
                            <X size={16} />
                            Close
                          </button>
                        )}
                        {project.status !== "funded" && (
                          <button
                            onClick={() => handleMarkFunded(project._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-medium"
                          >
                            <DollarSign size={16} />
                            Funded
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageProjects;