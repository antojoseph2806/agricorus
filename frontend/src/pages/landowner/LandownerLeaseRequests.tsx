// src/pages/LandownerLeaseRequests.tsx
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

  // ✅ New: Securely fetch and open agreement
  const handleViewAgreement = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/leases/${leaseId}/agreement`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Important for PDFs
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
        <div className="p-8 flex justify-center items-center h-full min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="ml-4 text-gray-700">Loading lease requests...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-700 bg-red-100 rounded-lg border border-red-300 mx-auto max-w-lg mt-8">
          <p className="font-semibold text-lg">Error:</p>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {statusFilter === "all"
            ? "All Lease Requests"
            : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Lease Requests`}
        </h1>

        {leases.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
            <p className="text-gray-600 text-lg">
              No requests found for this category.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row border border-gray-100"
              >
                {/* Image Section */}
                <div className="relative w-full h-56 md:w-80 md:h-auto flex-shrink-0">
                  {lease.land?.landPhotos &&
                  lease.land.landPhotos.length > 0 ? (
                    <img
                      src={lease.land.landPhotos[0]}
                      alt={lease.land?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm p-4 text-center">
                      No Image Found in Data
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {lease.land?.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {typeof lease.land?.location === "string"
                        ? lease.land.location
                        : lease.land?.location?.address || "No location info"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-gray-500" />
                        <p>
                          <span className="font-semibold">Farmer:</span>{" "}
                          {lease.farmer?.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="text-gray-500" />
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {lease.farmer?.phone || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaClock className="text-gray-500" />
                        <p>
                          <span className="font-semibold">Duration:</span>{" "}
                          {lease.durationMonths} months
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaRupeeSign className="text-gray-500" />
                        <p>
                          <span className="font-semibold">Price:</span> ₹
                          {lease.pricePerMonth} / month
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(
                        lease.status
                      )}`}
                    >
                      {lease.status.charAt(0).toUpperCase() +
                        lease.status.slice(1)}
                    </span>

                    <div className="flex space-x-2">
                      {lease.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAction(lease._id, "accept")}
                            disabled={actionLoading === lease._id}
                            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === lease._id ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaCheckCircle className="mr-2" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(lease._id, "cancel")}
                            disabled={actionLoading === lease._id}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === lease._id ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaTimesCircle className="mr-2" />
                            )}
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Agreement button */}
                      {["accepted", "active"].includes(lease.status) && (
                        <button
                          onClick={() => handleViewAgreement(lease._id)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <FaFilePdf className="mr-2" /> View Agreement
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
    </Layout>
  );
};

export default LandownerLeaseRequests;
