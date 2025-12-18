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
  FaCloud,
  FaServer,
  FaExclamationTriangle,
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
  Database,
} from "lucide-react";

interface LeaseRequestsProps {
  statusFilter: "all" | "pending" | "accepted" | "cancelled" | "active";
}

// --- New Component: Dispute Form (Simplified for this update) ---
interface DisputeModalProps {
  leaseId: string;
  onClose: () => void;
  onDisputeRaised: (message: string) => void;
}

const DisputeForm: React.FC<DisputeModalProps> = ({ leaseId, onClose, onDisputeRaised }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      // Replace with a proper form submission logic including all required fields
      const payload = {
        reason: reason || "Unspecified issue",
        details: details || "No details provided.",
        category: "Other", // Must match one of your backend's expected categories
        dateOfIncident: new Date().toISOString().split('T')[0], // Today's date
        amountInvolved: 0,
        preferredResolution: "Mediation",
      };

      await axios.post(
        `http://localhost:5000/api/landowner/disputes/${leaseId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onDisputeRaised("Dispute successfully raised. Our team will review it shortly.");
      onClose();
    } catch (err: any) {
      console.error("Dispute error:", err);
      const errorMsg = err.response?.data?.error || "Failed to raise dispute.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2a88] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <FaExclamationTriangle className="w-6 h-6 mr-2 text-red-400" />
          Raise a Dispute for Lease ID: {leaseId.substring(0, 8)}...
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-white bg-white/5 rounded-lg border border-white/10 focus:border-red-500 focus:outline-none"
              placeholder="e.g., Late Payment, Land Misuse, etc."
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 text-white bg-white/5 rounded-lg border border-white/10 focus:border-red-500 focus:outline-none h-24"
              placeholder="Provide a detailed description of the incident..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 font-bold text-white rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #ff3b3b 0%, #ff5e5e 100%)',
              }}
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaExclamationTriangle className="mr-2" />}
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// -----------------------------------------------------------------


const LandownerLeaseRequests: React.FC<LeaseRequestsProps> = ({
  statusFilter,
}) => {
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);

  // Function to show the modal
  const handleRaiseDispute = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    setIsDisputeModalOpen(true);
  };

  // Function to handle the dispute being successfully raised
  const handleDisputeRaised = (message: string) => {
    // Optionally trigger a data refresh or just show a notification
    alert(message);
    // You might want to update the lease object to show a 'Dispute Raised' flag
    // For now, we'll just close the modal.
  };


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

  /**
   * ✅ SIMPLIFIED LOGIC: ONLY uses the agreementUrl provided in the lease object
   * as requested by the user. No secondary API call is performed.
   */
  const handleViewAgreement = (agreementUrl?: string) => {
    if (agreementUrl) {
      // Directly opens the URL in a new tab
      window.open(agreementUrl, "_blank");
    } else {
      console.error("Agreement URL not found in lease data.");
      alert("Agreement URL is not available for this lease."); 
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-700" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-700" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-700" />;
      case "active":
        return <Zap className="w-4 h-4 text-blue-700" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-700" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium text-lg">Loading lease requests...</p>
            <p className="text-gray-500 text-sm">Fetching your data</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-4xl mx-auto mt-8">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <div>
                <p className="font-bold text-lg">Error</p>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500">
                {getFilterIcon()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {getFilterTitle()}
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage and monitor agricultural lease operations
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Total Requests", value: leases.length, icon: Database, color: "bg-blue-500" },
              { label: "Pending", value: leases.filter(l => l.status === "pending").length, icon: Clock, color: "bg-yellow-500" },
              { label: "Active", value: leases.filter(l => l.status === "active").length, icon: Zap, color: "bg-green-500" },
              { label: "Completed", value: leases.filter(l => l.status === "accepted").length, icon: CheckCircle, color: "bg-purple-500" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leases.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FaCloud className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">
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
                  className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden"
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
                        <div className="w-full h-48 lg:h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                          <FaServer className="h-12 w-12 mb-2" />
                          <span className="text-sm">No image available</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lease.status)}`}>
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {lease.land?.title || "Untitled Land"}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm">
                              <FaMapMarkerAlt className="w-4 h-4 mr-2 text-emerald-500" />
                              <span className="line-clamp-1">
                                {typeof lease.land?.location === "string"
                                  ? lease.land.location
                                  : lease.land?.location?.address || "No location info"}
                              </span>
                            </div>
                          </div>

                          {/* Farmer Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">Farmer Details</p>
                              <div className="flex items-center mb-2">
                                <FaUser className="w-4 h-4 text-blue-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-900">
                                  {lease.farmer?.name || "N/A"}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <FaPhone className="w-4 h-4 text-green-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-900">
                                  {lease.farmer?.phone || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <p className="text-xs text-gray-500 mb-2">Lease Terms</p>
                              <div className="flex items-center mb-2">
                                <FaClock className="w-4 h-4 text-yellow-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-900">
                                  {lease.durationMonths} months
                                </p>
                              </div>
                              <div className="flex items-center">
                                <FaRupeeSign className="w-4 h-4 text-green-500 mr-2" />
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹{lease.pricePerMonth}/month
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                          {lease.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(lease._id, "accept")}
                                disabled={actionLoading === lease._id}
                                className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50"
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
                                className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
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
                              onClick={() => handleViewAgreement(lease.agreementUrl)}
                              className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                            >
                              <FaFilePdf className="mr-2" />
                              View Agreement
                            </button>
                          )}

                          {/* 🚨 Raise Dispute Button for Active Leases 🚨 */}
                          {lease.status === "active" && (
                            <button
                              onClick={() => handleRaiseDispute(lease._id)}
                              className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-all duration-300"
                            >
                              <FaExclamationTriangle className="mr-2" />
                              Raise Dispute
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
      </div>

      {/* 🚨 Dispute Modal Rendering 🚨 */}
      {isDisputeModalOpen && selectedLeaseId && (
        <DisputeForm
          leaseId={selectedLeaseId}
          onClose={() => setIsDisputeModalOpen(false)}
          onDisputeRaised={handleDisputeRaised}
        />
      )}
    </Layout>
  );
};

export default LandownerLeaseRequests;