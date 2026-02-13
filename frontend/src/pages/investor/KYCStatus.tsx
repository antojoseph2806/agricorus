import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, AlertCircle, FileText, Calendar, Hash, RefreshCw } from "lucide-react";
import { InvestorLayout } from "./InvestorLayout";

interface KYCRecord {
  documentType: string;
  documentImage: string;
  extractedNumber: string;
  status: "Verified" | "Pending" | "Rejected";
  createdAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export const KYCStatus = () => {
  const [kyc, setKyc] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    const isRefreshing = refreshing;
    try {
      if (!isRefreshing) setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/kyc/status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setKyc(data);
    } catch (err: any) {
      console.error("KYC Status Error:", err);
      setError(err.message || "Failed to load KYC status. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Verified":
        return <ShieldCheck className="w-5 h-5 text-green-600" />;
      case "Pending":
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      case "Rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-50 border-green-200 text-green-800";
      case "Pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "Rejected":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Verified":
        return "Your KYC verification has been successfully completed and approved.";
      case "Pending":
        return "Your KYC documents are under review. This usually takes 1-2 business days.";
      case "Rejected":
        return "Your KYC submission requires attention. Please check the reason below.";
      default:
        return "KYC verification status unknown.";
    }
  };

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <Loader2 className="animate-spin w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading KYC status...</p>
          </div>
        </div>
      </InvestorLayout>
    );
  }

  if (error) {
    return (
      <InvestorLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load KYC Status</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchStatus}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/investor/verify-identity'}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Go to KYC Upload
              </button>
            </div>
          </div>
        </div>
      </InvestorLayout>
    );
  }

  return (
    <InvestorLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KYC Verification Status</h1>
              <p className="text-gray-600">View your identity verification status and details</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {kyc ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Status Overview */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Details</h3>
              
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border ${getStatusColor(kyc.status)} mb-6`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(kyc.status)}
                  <div>
                    <h4 className="font-semibold">Status: {kyc.status}</h4>
                    <p className="text-sm mt-1">{getStatusDescription(kyc.status)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Document Type</p>
                    <p className="font-medium text-gray-900">{kyc.documentType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Hash className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Document Number</p>
                    <p className="font-medium text-gray-900">{kyc.extractedNumber}</p>
                  </div>
                </div>

                {kyc.createdAt && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Submitted On</p>
                      <p className="font-medium text-gray-900">
                        {new Date(kyc.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {kyc.reviewedAt && (
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {new Date(kyc.reviewedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {kyc.status === "Rejected" && kyc.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800 mb-1">Rejection Reason</p>
                      <p className="text-red-700">{kyc.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Document Preview & Actions */}
            <div className="space-y-6">
              {/* Document Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={kyc.documentImage}
                    alt={`${kyc.documentType} document`}
                    className="w-full h-auto max-h-64 object-contain rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%239ca3af'%3EDocument Image Not Available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center mt-3">
                  Submitted document for verification
                </p>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {kyc.status === "Rejected" && (
                    <a
                      href="/kyc/upload"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Resubmit KYC Documents
                    </a>
                  )}
                  
                  <a
                    href="/support"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No KYC Submitted State */
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <FileText className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">KYC Not Submitted</h3>
              <p className="text-yellow-700 mb-2">
                You haven't submitted your KYC verification documents yet.
              </p>
              <p className="text-yellow-600 mb-6">
                Complete your KYC verification to access all investment features.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/kyc/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Submit KYC Documents
                </a>
                <a
                  href="/kyc/guide"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-yellow-600 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </InvestorLayout>
  );
};