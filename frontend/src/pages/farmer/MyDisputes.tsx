import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Clock, CheckCircle, XCircle, FileText, Package } from "lucide-react";

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
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-gray-800 text-xl font-semibold mb-2">Loading Disputes</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
                <p className="text-gray-600 mt-1">Track and manage your dispute cases</p>
              </div>
            </div>
            {disputes.length > 0 && (
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Total Cases: </span>
                <span className="text-lg font-bold text-gray-900">{disputes.length}</span>
              </div>
            )}
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Disputes</h3>
            <p className="text-gray-600 mb-4">
              You haven't raised any dispute cases yet. All your case files will appear here once submitted.
            </p>
            <div className="inline-flex items-center bg-emerald-50 rounded-lg px-4 py-2 border border-emerald-200">
              <span className="text-emerald-800 text-sm font-medium">
                System Ready for Case Submission
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cases Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {disputes.map((d) => (
                <div
                  key={d._id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Status and Date */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColors(d.status)}`}>
                        {getStatusIcon(d.status)}
                        <span className="ml-1">{d.status.toUpperCase()}</span>
                      </span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {new Date(d.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    {/* Reason */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {d.reason}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-6">
                      This case file is currently under review. Monitor for real-time updates and resolution progress.
                    </p>

                    {/* View Agreement */}
                    {d.lease?.agreementUrl && (
                      <a
                        href={d.lease.agreementUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Contract Document
                      </a>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 font-mono">
                      Case ID: {d._id.slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Status Footer */}
            <div className="text-center">
              <div className="inline-flex items-center bg-white rounded-lg px-6 py-3 border shadow-sm">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-gray-600 text-sm font-medium">
                  Monitoring <span className="text-gray-900 font-semibold">{disputes.length}</span> active case{disputes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDisputes;
