import { useEffect, useState } from "react";
import axios from "axios";
import { XCircle, User, Calendar, TrendingDown, Archive, Package, Lock } from "lucide-react";

interface Farmer {
  _id: string;
  email: string;
  name: string;
}

interface Project {
  _id: string;
  farmerId: Farmer;
  title: string;
  description: string;
  cropType: string;
  fundingGoal: number;
  currentFunding: number;
  status: string;
  isApproved: boolean;
  startDate: string;
  endDate: string;
  slug: string;
}

export default function ClosedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://agricorus.onrender.com/api/projects/closed",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching closed projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-gray-800 text-xl font-semibold mb-2">Loading Projects</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Archived Projects</h1>
              <p className="text-gray-600 mt-1">Review completed, expired, and terminated funding projects</p>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Archived Projects</h3>
            <p className="text-gray-600">There are currently no completed projects in the archive.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const fundingPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
              const endedDate = new Date(project.endDate);
              const isSuccessfullyFunded = project.currentFunding >= project.fundingGoal;
              
              return (
                <div 
                  key={project._id} 
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center ${
                        isSuccessfullyFunded 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {isSuccessfullyFunded ? (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            COMPLETED
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            ENDED
                          </>
                        )}
                      </span>
                      {!project.isApproved && (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                          NOT APPROVED
                        </span>
                      )}
                    </div>

                    {/* Title and Description */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {project.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">Final Status</span>
                        <span className="font-semibold text-gray-900">{fundingPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isSuccessfullyFunded 
                              ? "bg-emerald-600" 
                              : "bg-red-500"
                          }`}
                          style={{ width: `${fundingPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-900 font-semibold">₹{project.currentFunding.toLocaleString()}</span>
                        <span className="text-gray-600">₹{project.fundingGoal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Crop Type</p>
                        <p className="text-sm font-semibold text-gray-900">{project.cropType}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Target</p>
                        <p className="text-sm font-semibold text-gray-900">₹{project.fundingGoal.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Farmer Info */}
                    <div className="flex items-center text-sm text-gray-600 mb-3 pb-3 border-b border-gray-200">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-900">{project.farmerId?.name}</span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Archived: {endedDate.toLocaleDateString('en-IN')}</span>
                    </div>

                    {/* Status Footer */}
                    <div className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Project Archived
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {projects.length > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center bg-white rounded-lg px-6 py-3 border shadow-sm">
              <Archive className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-gray-600 text-sm font-medium">
                Archived <span className="text-gray-900 font-semibold">{projects.length}</span> project{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
