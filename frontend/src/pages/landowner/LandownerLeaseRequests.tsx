import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "./LandownerDashboard";
import {
  FaUser,
  FaPhone,
  FaClock,
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFilePdf,
  FaMapMarkerAlt,
  FaSeedling,
  FaCloud,
  FaServer,
  FaShieldAlt,
  // NOTE: FaDatabase is still imported, but we'll use lucide's Database for consistency in the UI
  FaDatabase
} from "react-icons/fa";
import {
  Zap,
  Cpu,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Database // <--- FIX: Added missing 'Database' import from lucide-react
} from "lucide-react";

interface LeaseRequestsProps {
  statusFilter: "all" | "pending" | "accepted" | "cancelled" | "active";
}

const LandownerLeaseRequests: React.FC<LeaseRequestsProps> = ({
  statusFilter,
}) => {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "http://localhost:5000/api/leases/owner/requests";
        if (statusFilter !== "all") {
          url = `http://localhost:5000/api/leases/owner/requests/${statusFilter}`;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized: Please login as a landowner.");
          setLoading(false);
          return;
        }

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLeases(res.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError(
            "Unauthorized: You must be logged in as a landowner to view requests."
          );
        } else {
          setError("Failed to fetch lease requests.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

  const handleAction = async (leaseId: string, action: "accept" | "cancel") => {
    setActionLoading(leaseId);
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/leases/${leaseId}/${action}`;

      const res = await axios.put(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedLeases = leases.map((lease) =>
        lease._id === leaseId
          ? { ...lease, status: res.data.lease.status }
          : lease
      );
      setLeases(updatedLeases);
    } catch (err) {
      setError(`Failed to ${action} the lease request.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewAgreement = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/leases/${leaseId}/agreement`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error("Failed to fetch agreement:", err);
      alert("Could not open agreement. Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "active":
        return <Zap className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "accepted":
        return "Accepted";
      case "cancelled":
        return "Cancelled";
      case "active":
        return "Active Lease";
      default:
        return status;
    }
  };

  const getFilterTitle = () => {
    switch (statusFilter) {
      case "all":
        return "All Lease Requests";
      case "pending":
        return "Pending Requests";
      case "accepted":
        return "Accepted Requests";
      case "cancelled":
        return "Cancelled Requests";
      case "active":
        return "Active Leases";
      default:
        return "Lease Requests";
    }
  };

  const getFilterIcon = () => {
    switch (statusFilter) {
      case "all":
        return <Database className="w-6 h-6" />;
      case "pending":
        return <Clock className="w-6 h-6" />;
      case "accepted":
        return <CheckCircle className="w-6 h-6" />;
      case "cancelled":
        return <XCircle className="w-6 h-6" />;
      case "active":
        return <Zap className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div
          className="flex items-center justify-center min-h-screen relative"
          style={{
            background: 'linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 59, 59, 0.15) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            ></div>
          </div>
          
          <div className="flex flex-col items-center relative z-10">
            <div
              className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"
              style={{ borderImage: 'linear-gradient(135deg, #ff3b3b, #ff5e5e) 1' }}
            ></div>
            <p className="text-gray-300 font-medium text-lg">Loading lease requests...</p>
            <p className="text-gray-400 text-sm">Securing your data</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div
          className="min-h-screen p-6 relative"
          style={{
            background: 'linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          <div
            className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl max-w-4xl mx-auto mt-8"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-bold text-lg">Security Alert</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="min-h-screen p-6 relative"
        style={{
          background: 'linear-gradient(135deg, #0a1a55 0%, #1a2a88 50%, #2d3ba2 100%)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Glowing Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 59, 59, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600">
                {getFilterIcon()}
              </div>
              <div>
                <h1
                  className="text-3xl font-bold text-white uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {getFilterTitle()}
                </h1>
                <p className="text-gray-300 text-lg">
                  Manage and monitor agricultural lease operations in real-time
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Requests", value: leases.length, icon: Database, color: "from-blue-500 to-blue-600" },
              { label: "Pending", value: leases.filter(l => l.status === "pending").length, icon: Clock, color: "from-yellow-500 to-yellow-600" },
              { label: "Active", value: leases.filter(l => l.status === "active").length, icon: Zap, color: "from-green-500 to-green-600" },
              { label: "Completed", value: leases.filter(l => l.status === "accepted").length, icon: CheckCircle, color: "from-purple-500 to-purple-600" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leases.length === 0 ? (
            <div
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              }}
            >
              <div className="text-white/40 mb-4">
                <FaCloud className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No requests found</h3>
              <p className="text-gray-400">
                {statusFilter === "all"
                  ? "You don't have any lease requests yet."
                  : `No ${statusFilter} lease requests found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {leases.map((lease) => (
                <div
                  key={lease._id}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/20 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  }}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-80 flex-shrink-0 relative">
                      {lease.land?.landPhotos && lease.land.landPhotos.length > 0 ? (
                        <img
                          src={lease.land.landPhotos[0]}
                          alt={lease.land?.title}
                          className="w-full h-48 lg:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 lg:h-full bg-white/5 flex flex-col items-center justify-center text-white/40">
                          <FaServer className="h-12 w-12 mb-2" />
                          <span className="text-sm">No image available</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(lease.status)}`}>
                          {getStatusIcon(lease.status)}
                          {getStatusText(lease.status)}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {lease.land?.title || "Untitled Land"}
                            </h3>
                            <div className="flex items-center text-gray-300 text-sm">
                              <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-400" />
                              <span className="line-clamp-1">
                                {typeof lease.land?.location === "string"
                                  ? lease.land.location
                                  : lease.land?.location?.address || "No location info"}
                              </span>
                            </div>
                          </div>

                          {/* Farmer Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Farmer Details</p>
                              <div className="flex items-center mb-2">
                                <FaUser className="w-4 h-4 text-blue-400 mr-2" />
                                <p className="text-sm font-medium text-white">
                                  {lease.farmer?.name || "N/A"}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <FaPhone className="w-4 h-4 text-green-400 mr-2" />
                                <p className="text-sm font-medium text-white">
                                  {lease.farmer?.phone || "N/A"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Lease Terms</p>
                              <div className="flex items-center mb-2">
                                <FaClock className="w-4 h-4 text-yellow-400 mr-2" />
                                <p className="text-sm font-medium text-white">
                                  {lease.durationMonths} months
                                </p>
                              </div>
                              <div className="flex items-center">
                                <FaRupeeSign className="w-4 h-4 text-green-400 mr-2" />
                                <p className="text-sm font-medium text-white">
                                  ₹{lease.pricePerMonth}/month
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                          {lease.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(lease._id, "accept")}
                                disabled={actionLoading === lease._id}
                                className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                }}
                              >
                                {actionLoading === lease._id ? (
                                  <FaSpinner className="animate-spin mr-2" />
                                ) : (
                                  <FaCheckCircle className="mr-2" />
                                )}
                                Accept Request
                              </button>
                              <button
                                onClick={() => handleAction(lease._id, "cancel")}
                                disabled={actionLoading === lease._id}
                                className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
                                style={{
                                  background: 'linear-gradient(135deg, #ff3b3b 0%, #ff5e5e 100%)',
                                }}
                              >
                                {actionLoading === lease._id ? (
                                  <FaSpinner className="animate-spin mr-2" />
                                ) : (
                                  <FaTimesCircle className="mr-2" />
                                )}
                                Cancel Request
                              </button>
                            </>
                          )}

                          {["accepted", "active"].includes(lease.status) && (
                            <button
                              onClick={() => handleViewAgreement(lease._id)}
                              className="flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              }}
                            >
                              <FaFilePdf className="mr-2" />
                              View Agreement
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        `}</style>
      </div>
    </Layout>
  );
};

export default LandownerLeaseRequests;