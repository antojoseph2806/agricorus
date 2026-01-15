import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "./LandownerDashboard"; // Assuming Layout is available
import { 
  FaDatabase, 
  FaClock, 
  FaExclamationTriangle, 
  FaFilePdf, 
  FaUser, 
  FaTag, 
  FaRupeeSign,
  FaSpinner 
} from "react-icons/fa";
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Database, 
  UserCheck, 
  Scale 
} from "lucide-react";

// Define the structure for a Dispute object
interface Dispute {
  _id: string;
  lease?: {
    _id: string;
    title?: string;
    location?: string;
    status?: string;
  } | null;
  against?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  reason: string;
  category: string;
  details: string;
  status: "open" | "under_review" | "resolved" | "rejected";
  amountInvolved?: number;
  createdAt: string;
  updatedAt: string;
}

const LandownerDisputeHistory: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = "http://localhost:5000/api/landowner/disputes";
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Unauthorized: Please login as a landowner.");
          setLoading(false);
          return;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 🚨 Fetch logic is CORRECT: It targets the 'disputes' array from the response object. 🚨
        setDisputes(res.data.disputes || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError("Unauthorized: Session expired or invalid token.");
        } else {
          setError("Failed to fetch dispute history.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  // Utility functions for rendering status (No changes needed here)
  const getDisputeStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case "open":
        return <FaClock className="w-4 h-4 text-yellow-400" />;
      case "under_review":
        return <Zap className="w-4 h-4 text-blue-400" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDisputeStatusColor = (status: Dispute['status']) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "under_review":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDisputeStatusText = (status: Dispute['status']) => {
    const textMap = {
      open: "Open",
      under_review: "Under Review",
      resolved: "Resolved",
      rejected: "Rejected",
    };
    return textMap[status] || status;
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium text-lg">Fetching dispute history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl max-w-4xl mx-auto mt-8">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-600">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dispute History
                </h1>
                <p className="text-gray-600 text-lg">
                  Track the status and details of all disputes you have raised.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3 flex items-center">
                <FaDatabase className="w-5 h-5 mr-2 text-emerald-600" />
                Total Disputes Raised: <span className="text-emerald-600 ml-2">{disputes.length}</span>
            </h2>

            {disputes.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                    <FaExclamationTriangle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg text-gray-900">No dispute records found.</p>
                    <p className="text-sm">Raise a dispute from an active lease request to begin.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {disputes.map((dispute) => (
                        <div
                            key={dispute._id}
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 border-b border-gray-200 pb-3">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaTag className="w-5 h-5 mr-2 text-emerald-600" />
                                    {dispute.reason}
                                </h3>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mt-2 sm:mt-0 ${getDisputeStatusColor(dispute.status)}`}>
                                    {getDisputeStatusIcon(dispute.status)}
                                    {getDisputeStatusText(dispute.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                <p className="flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                    <span className="font-semibold text-gray-900 mr-1">Lease:</span>
                                    {dispute.lease?.title || (dispute.lease?._id ? `Lease ID: ${dispute.lease._id.substring(0, 8)}...` : 'N/A')}
                                </p>
                                <p className="flex items-center">
                                    <UserCheck className="w-4 h-4 mr-2 text-emerald-600" />
                                    <span className="font-semibold text-gray-900 mr-1">Against:</span>
                                    {dispute.against?.name || 'Unknown Farmer'}
                                </p>
                                <p className="flex items-center">
                                    <FaRupeeSign className="w-4 h-4 mr-2 text-red-600" />
                                    <span className="font-semibold text-gray-900 mr-1">Amount:</span>
                                    ₹{dispute.amountInvolved?.toLocaleString() || '0'}
                                </p>
                            </div>
                            
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Details</p>
                                <p className="text-gray-900 text-sm italic">{dispute.details || "No detailed description provided."}</p>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => alert(`Viewing details for dispute ${dispute._id}`)}
                                    className="flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-sm"
                                >
                                    <FaFilePdf className="w-3 h-3 mr-2" />
                                    View Resolution
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandownerDisputeHistory;