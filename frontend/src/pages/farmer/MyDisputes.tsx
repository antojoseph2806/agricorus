import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface Lease {
  _id: string;
  agreementUrl: string;
  owner: string;
  farmer: string;
  status: string;
}

interface Dispute {
  _id: string;
  reason: string;
  status: string;
  createdAt: string;
  lease: Lease;
}

const MyDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/disputes/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDisputes(res.data);
      } catch (err) {
        console.error("Error fetching disputes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your disputes...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FaClock className="text-yellow-500 mr-1" />;
      case "resolved":
        return <FaCheckCircle className="text-green-500 mr-1" />;
      default:
        return <FaTimesCircle className="text-red-500 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flipkart-style Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
            <h1 className="text-xl font-bold text-gray-800">My Disputes</h1>
          </div>
          <span className="text-sm text-gray-600">
            {localStorage.getItem("email") || "User"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {disputes.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">⚖️</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No disputes found</h3>
            <p className="text-gray-500 mb-4">
              You haven't raised any disputes yet. All your dispute cases will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            <div className="bg-white rounded-sm shadow-sm p-4 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">
                Dispute Cases ({disputes.length})
              </h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {disputes.map((d) => (
                <div
                  key={d._id}
                  className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden"
                >
                  <div className="p-5">
                    {/* Status and Date */}
                    <div className="flex justify-between items-center mb-4">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        d.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : d.status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {getStatusIcon(d.status)}
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(d.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    {/* Reason */}
                    <h3 className="text-md font-semibold text-gray-800 mb-3 line-clamp-2">
                      {d.reason}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      This dispute was raised and is currently under review. Please check back for updates.
                    </p>

                    {/* View Agreement */}
                    {d.lease?.agreementUrl && (
                      <a
                        href={d.lease.agreementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        <FaEye className="mr-1.5" />
                        View Agreement Document
                      </a>
                    )}
                  </div>
                  
                  {/* Footer with subtle background */}
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Case ID: {d._id.slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDisputes;