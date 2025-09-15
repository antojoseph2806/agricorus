import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircleIcon, UserIcon, CalendarIcon, CurrencyRupeeIcon } from "@heroicons/react/24/solid";

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

export default function ApprovedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/projects/projects/approved")
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading approved projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Approved Projects</h1>
              <p className="text-gray-600 text-sm">Browse through successfully funded agricultural projects</p>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No approved projects</h3>
            <p className="text-gray-500">There are currently no approved projects available.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const fundingPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
              const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={project._id} className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
                  <div className="p-5">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Approved
                      </div>
                      <span className="text-xs text-gray-500">{daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}</span>
                    </div>

                    {/* Title and Description */}
                    <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{project.title}</h2>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{project.description}</p>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Funded</span>
                        <span className="font-medium">{fundingPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fundingPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>₹{project.currentFunding.toLocaleString()}</span>
                        <span>₹{project.fundingGoal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 p-2 rounded-sm">
                        <p className="text-xs text-gray-500 mb-1">Crop Type</p>
                        <p className="text-sm font-medium text-gray-800">{project.cropType}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-sm">
                        <p className="text-xs text-gray-500 mb-1">Goal</p>
                        <p className="text-sm font-medium text-gray-800">₹{project.fundingGoal.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Farmer Info */}
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <UserIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                      <span className="font-medium">{project.farmerId?.name}</span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1.5" />
                      Ends: {new Date(project.endDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors text-sm font-medium">
                      <CurrencyRupeeIcon className="h-4 w-4 mr-1.5" />
                      Support Project
                    </button>
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