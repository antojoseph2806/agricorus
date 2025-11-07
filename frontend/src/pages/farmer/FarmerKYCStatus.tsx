import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Clock, CheckCircle, XCircle } from "lucide-react";

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
  const API_URL = "https://agricorus.onrender.com"; // Change this if backend is hosted elsewhere

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
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  if (!kyc)
    return (
      <div className="text-center mt-10 text-gray-600">
        No KYC record found. Please submit your KYC.
      </div>
    );

  const StatusIcon =
    kyc.status === "Verified"
      ? CheckCircle
      : kyc.status === "Rejected"
      ? XCircle
      : Clock;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10">
      <h2 className="text-2xl font-semibold text-center mb-6">KYC Status</h2>

      <div className="flex justify-center mb-4">
        <StatusIcon
          size={40}
          className={`${
            kyc.status === "Verified"
              ? "text-green-500"
              : kyc.status === "Rejected"
              ? "text-red-500"
              : "text-yellow-500"
          }`}
        />
      </div>

      <div className="text-center space-y-2">
        <p>
          <strong>Document Type:</strong> {kyc.documentType}
        </p>
        <p>
          <strong>Document Number:</strong> {kyc.extractedNumber}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`${
              kyc.status === "Verified"
                ? "text-green-600"
                : kyc.status === "Rejected"
                ? "text-red-600"
                : "text-yellow-600"
            } font-medium`}
          >
            {kyc.status}
          </span>
        </p>
        <p>
          <strong>Submitted On:</strong>{" "}
          {new Date(kyc.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="mt-5 flex justify-center">
        <img
          src={kyc.documentImage}
          alt="KYC Document"
          className="w-64 h-40 object-cover rounded-lg border"
        />
      </div>
    </div>
  );
};

export default FarmerKYCStatus;
