import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaExclamationTriangle, FaFileContract, FaShieldAlt } from "react-icons/fa";

interface Lease {
  _id: string;
  agreementUrl: string;
  farmer: string;
  owner: string;
  status: string;
}

interface Dispute {
  _id: string;
  reason: string;
  status: string;
  createdAt: string;
  raisedBy: string;
  lease: Lease;
}

const AgainstDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/disputes/against/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDisputes(res.data);
      } catch (err) {
        console.error("Error fetching disputes against you", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
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
          <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">SECURITY SCAN</h3>
          <p className="text-gray-300 font-light">Checking for reported incidents</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-400 mr-2" />;
      case "resolved":
        return <FaCheckCircle className="text-green-400 mr-2" />;
      default:
        return <FaTimesCircle className="text-red-400 mr-2" />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-400/30";
      default:
        return "bg-red-500/20 text-red-400 border-red-400/30";
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaShieldAlt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider">INCIDENT REPORTS</h1>
                <div className="w-16 h-1 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full mt-2"></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-sm font-light">Account Under Review</p>
              <p className="text-white font-bold uppercase tracking-wide">
                {localStorage.getItem("email") || "USER ACCOUNT"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {disputes.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                <div className="text-4xl">✅</div>
              </div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-3">CLEAN SECURITY RECORD</h3>
              <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed mb-6">
                No security incidents reported against your account. Your profile maintains excellent standing.
              </p>
              <div className="inline-flex items-center bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <FaShieldAlt className="h-4 w-4 text-green-400 mr-3" />
                <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                  Account Status: Secure
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Security Alert Header */}
              <div className="bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-400/30 p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className="w-10 h-10 bg-red-500/30 rounded-xl flex items-center justify-center mr-4 border border-red-400/50">
                      <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-1">
                        SECURITY ALERT
                      </h2>
                      <p className="text-red-200 font-light">
                        {disputes.length} active incident{disputes.length !== 1 ? 's' : ''} reported against your account
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center bg-red-500/30 backdrop-blur-sm rounded-xl px-4 py-2 border border-red-400/50">
                    <span className="text-red-200 text-sm font-bold uppercase tracking-wide">
                      Priority: <span className="text-white">HIGH</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Incidents Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {disputes.map((d) => (
                  <div
                    key={d._id}
                    className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    <div className="p-6">
                      {/* Status and Date */}
                      <div className="flex justify-between items-center mb-4">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-sm ${getStatusColors(d.status)}`}>
                          {getStatusIcon(d.status)}
                          {d.status.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                          {new Date(d.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      {/* Raised By */}
                      <div className="flex items-center text-sm text-gray-300 mb-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 border border-blue-400/30">
                          <FaUser className="h-3 w-3 text-blue-400" />
                        </div>
                        <span>
                          Reported by: <span className="font-bold text-white">USER_{d.raisedBy.slice(-6).toUpperCase()}</span>
                        </span>
                      </div>

                      {/* Reason */}
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-3 line-clamp-2 leading-tight">
                        {d.reason}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                        This security incident has been reported against your account. Review details and contact system administration for resolution.
                      </p>

                      {/* View Agreement */}
                      {d.lease?.agreementUrl && (
                        <a
                          href={d.lease.agreementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-white hover:text-[#ff6b6b] font-bold uppercase tracking-wide text-sm transition-all duration-300 hover:scale-105 group/view"
                        >
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 border border-blue-400/30 group-hover/view:border-[#ff6b6b]/30 transition-colors duration-300">
                            <FaFileContract className="h-3 w-3" />
                          </div>
                          REVIEW CONTRACT
                        </a>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-white/5 backdrop-blur-sm px-6 py-4 border-t border-white/10">
                      <div className="text-xs text-gray-300 font-mono">
                        INCIDENT ID: {d._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Status Footer */}
              <div className="text-center mt-8">
                <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
                  <FaShieldAlt className="h-4 w-4 text-[#ff3b3b] mr-3" />
                  <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                    Security System Monitoring {disputes.length} Active Incident{disputes.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgainstDisputes;