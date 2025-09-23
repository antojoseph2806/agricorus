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
  FaSeedling
} from "react-icons/fa";

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading lease requests...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm mb-6">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{getFilterTitle()}</h1>
                <p className="text-gray-600 text-sm">
                  Manage lease requests for your agricultural lands
                </p>
              </div>
            </div>
          </div>

          {leases.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
              <div className="text-5xl text-gray-300 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {statusFilter === "all" 
                  ? "You don't have any lease requests yet."
                  : `No ${statusFilter} lease requests found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {leases.map((lease) => (
                <div key={lease._id} className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="md:w-64 flex-shrink-0">
                      {lease.land?.landPhotos && lease.land.landPhotos.length > 0 ? (
                        <img
                          src={lease.land.landPhotos[0]}
                          alt={lease.land?.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                          <FaSeedling className="h-12 w-12 mb-2" />
                          <span className="text-sm">No image available</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5">
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">
                                {lease.land?.title || "Untitled Land"}
                              </h3>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <FaMapMarkerAlt className="h-3 w-3 mr-1.5 text-gray-400" />
                                <span className="line-clamp-1">
                                  {typeof lease.land?.location === "string"
                                    ? lease.land.location
                                    : lease.land?.location?.address || "No location info"}
                                </span>
                              </div>
                            </div>
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lease.status)} mt-2 sm:mt-0`}>
                              {getStatusText(lease.status)}
                            </div>
                          </div>

                          {/* Farmer Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Farmer</p>
                              <div className="flex items-center">
                                <FaUser className="h-3 w-3 text-gray-500 mr-2" />
                                <p className="text-sm font-medium text-gray-800">
                                  {lease.farmer?.name || "N/A"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Contact</p>
                              <div className="flex items-center">
                                <FaPhone className="h-3 w-3 text-gray-500 mr-2" />
                                <p className="text-sm font-medium text-gray-800">
                                  {lease.farmer?.phone || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Lease Details */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Duration</p>
                              <div className="flex items-center">
                                <FaClock className="h-3 w-3 text-gray-500 mr-2" />
                                <p className="text-sm font-medium text-gray-800">
                                  {lease.durationMonths} months
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-sm">
                              <p className="text-xs text-gray-500 mb-1">Monthly Price</p>
                              <div className="flex items-center">
                                <FaRupeeSign className="h-3 w-3 text-gray-500 mr-2" />
                                <p className="text-sm font-medium text-gray-800">
                                  ₹{lease.pricePerMonth}/month
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                          {lease.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAction(lease._id, "accept")}
                                disabled={actionLoading === lease._id}
                                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
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
                                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
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
                              className="flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors text-sm font-medium"
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
      </div>
    </Layout>
  );
};

export default LandownerLeaseRequests;