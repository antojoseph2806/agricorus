import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Clock, CheckCircle, XCircle, Shield } from "lucide-react";

interface KYCRecord {
  documentType: string;
  extractedNumber: string;
  status: string;
  documentImage: string;
  createdAt: string;
}

const FarmerKYCStatus: React.FC = () => {
  const [kyc, setKyc] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Backend URL (no .env needed)
  const API_URL = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}`; // Change this if backend is hosted elsewhere

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKyc(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch KYC status");
      } finally {
        setLoading(false);
      }
    };

    fetchKYC();
  }, []);

  if (loading)
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4"><div className="text-center"><div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div><p className="text-gray-700 text-base sm:text-lg font-medium">Loading...</p></div></div>;

  if (!kyc)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <p className="text-base sm:text-lg text-gray-600">
            No KYC record found. Please submit your KYC.
          </p>
        </div>
      </div>
    );

  const StatusIcon =
    kyc.status === "Verified"
      ? CheckCircle
      : kyc.status === "Rejected"
      ? XCircle
      : Clock;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4 sm:mb-6">KYC Status</h2>

          <div className="flex justify-center mb-4 sm:mb-6">
            <StatusIcon
              size={40}
              className={`w-10 h-10 sm:w-12 sm:h-12 ${
                kyc.status === "Verified"
                  ? "text-green-500"
                  : kyc.status === "Rejected"
                  ? "text-red-500"
                  : "text-yellow-500"
              }`}
            />
          </div>

          <div className="text-center space-y-3 sm:space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Document Type</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{kyc.documentType}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Document Number</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 font-mono">{kyc.extractedNumber}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
              <span
                className={`inline-block text-sm sm:text-base ${
                  kyc.status === "Verified"
                    ? "text-green-600"
                    : kyc.status === "Rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                } font-semibold`}
              >
                {kyc.status}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Submitted On</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {new Date(kyc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex justify-center">
            <img
              src={kyc.documentImage}
              alt="KYC Document"
              className="w-full max-w-md h-48 sm:h-56 object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerKYCStatus;
