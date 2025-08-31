// src/pages/LandownerLeaseRequests.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from './LandownerDashboard';
import { FaLandmark, FaUser, FaEnvelope, FaPhone, FaClock, FaRupeeSign, FaTag, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

interface LeaseRequestsProps {
  statusFilter: "all" | "pending" | "accepted" | "cancelled";
}

const LandownerLeaseRequests: React.FC<LeaseRequestsProps> = ({ statusFilter }) => {
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
          url += `?status=${statusFilter}`;
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
          setError("Unauthorized: You must be logged in as a landowner to view requests.");
        } else {
          setError("Failed to fetch lease requests.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter]);

  const handleAction = async (leaseId: string, action: 'accept' | 'cancel') => {
    setActionLoading(leaseId);
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/leases/${leaseId}/${action}`;

      const res = await axios.put(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the local state
      const updatedLeases = leases.map(lease =>
        lease._id === leaseId ? { ...lease, status: res.data.lease.status } : lease
      );
      setLeases(updatedLeases);

    } catch (err) {
      setError(`Failed to ${action} the lease request.`);
    } finally {
      setActionLoading(null);
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'; // Keep yellow for pending as it's a standard warning color
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800'; // Use emerald for accepted to match dashboard green
      case 'cancelled':
        return 'bg-red-100 text-red-800'; // Keep red for cancelled
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-emerald-500 pb-2"> {/* Green border */}
          {statusFilter === "all" ? "All Lease Requests" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Lease Requests`}
        </h2>

        {leases.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-200">
            <p className="text-gray-600 text-lg">No requests found for this category.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <li key={lease._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <FaLandmark className="text-emerald-600 mr-3 text-2xl" /> {/* Green icon */}
                    <h3 className="text-xl font-semibold text-gray-900 leading-tight">{lease.land?.title}</h3>
                  </div>
                  <p className="flex items-center text-gray-700 mb-2">
                    <FaLandmark className="text-gray-500 mr-2" />
                    <span>{lease.land?.location.address}</span>
                  </p>
                  <div className="border-t border-gray-200 my-4"></div>

                  <div className="space-y-3 text-gray-800">
                    <p className="flex items-center">
                      <FaUser className="text-gray-500 mr-3" />
                      <strong className="text-gray-900">Farmer:</strong> {lease.farmer?.name}
                    </p>
                    <p className="flex items-center">
                      <FaEnvelope className="text-gray-500 mr-3" />
                      <strong className="text-gray-900">Email:</strong> {lease.farmer?.email}
                    </p>
                    <p className="flex items-center">
                      <FaPhone className="text-gray-500 mr-3" />
                      <strong className="text-gray-900">Phone:</strong> {lease.farmer?.phone}
                    </p>
                    <p className="flex items-center">
                      <FaClock className="text-gray-500 mr-3" />
                      <strong className="text-gray-900">Duration:</strong> {lease.durationMonths} months
                    </p>
                    <p className="flex items-center">
                      <FaRupeeSign className="text-gray-500 mr-3" />
                      <strong className="text-gray-900">Price/Month:</strong> ₹{lease.pricePerMonth}
                    </p>
                  </div>
                </div>

                <div className={`px-6 py-2 rounded-b-xl text-center font-bold ${getStatusColor(lease.status)}`}>
                  <p className="flex items-center justify-center text-sm">
                    <FaTag className="mr-2" />
                    Status: {lease.status.toUpperCase()}
                  </p>
                </div>

                {/* Action buttons for pending requests */}
                {lease.status === 'pending' && (
                  <div className="p-4 border-t border-gray-200 flex justify-end space-x-2 bg-gray-50">
                    <button
                      onClick={() => handleAction(lease._id, 'accept')}
                      disabled={actionLoading === lease._id}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === lease._id ? <FaSpinner className="animate-spin mr-2" /> : <FaCheckCircle className="mr-2" />}
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(lease._id, 'cancel')}
                      disabled={actionLoading === lease._id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === lease._id ? <FaSpinner className="animate-spin mr-2" /> : <FaTimesCircle className="mr-2" />}
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default LandownerLeaseRequests;