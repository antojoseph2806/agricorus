import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircleIcon, UserIcon, CalendarIcon, CurrencyRupeeIcon, ChartBarIcon, RocketLaunchIcon } from "@heroicons/react/24/solid";

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
      <div 
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">LOADING DEPLOYMENTS</h3>
          <p className="text-gray-300 font-light">Initializing successful project deployments</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] p-4 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8 shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <RocketLaunchIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">SUCCESSFUL DEPLOYMENTS</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-gray-300 text-lg font-light max-w-2xl leading-relaxed">
            Explore fully funded and approved agricultural initiatives ready for execution
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <div className="text-4xl">📊</div>
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-3">NO ACTIVE DEPLOYMENTS</h3>
            <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
              There are currently no approved project deployments available.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const fundingPercentage = Math.min((project.currentFunding / project.fundingGoal) * 100, 100);
              const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={project._id} 
                  className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-green-500/20 backdrop-blur-sm text-green-400 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full flex items-center border border-green-400/30">
                        <CheckCircleIcon className="h-3 w-3 mr-1.5" />
                        DEPLOYED
                      </div>
                      <span className="text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                        {daysRemaining > 0 ? `${daysRemaining} DAYS LEFT` : 'COMPLETED'}
                      </span>
                    </div>

                    {/* Title and Description */}
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-3 line-clamp-2 leading-tight">
                      {project.title}
                    </h2>
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span className="font-bold uppercase tracking-wide">Funding Progress</span>
                        <span className="font-bold text-white">{fundingPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                        <div
                          className="bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${fundingPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-white">₹{project.currentFunding.toLocaleString()}</span>
                        <span className="text-gray-300">₹{project.fundingGoal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                        <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Crop Type</p>
                        <p className="text-sm font-bold text-white">{project.cropType}</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                        <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Target</p>
                        <p className="text-sm font-bold text-white">₹{project.fundingGoal.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Farmer Info */}
                    <div className="flex items-center text-sm text-gray-300 mb-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 border border-blue-400/30">
                        <UserIcon className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="font-bold text-white">{project.farmerId?.name}</span>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center text-sm text-gray-300">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 border border-purple-400/30">
                        <CalendarIcon className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="font-medium">Deployment Ends: {new Date(project.endDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border-t border-white/10">
                    <button className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] hover:shadow-2xl hover:shadow-[#ff3b3b]/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 border border-[#ff3b3b]/20 group/support">
                      <CurrencyRupeeIcon className="h-5 w-5 mr-3 group-hover/support:scale-110 transition-transform duration-300" />
                      SUPPORT DEPLOYMENT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {projects.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
              <ChartBarIcon className="h-5 w-5 text-[#ff3b3b] mr-3" />
              <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                Displaying <span className="text-white">{projects.length}</span> Successful Deployment{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}