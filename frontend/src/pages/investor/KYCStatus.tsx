import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { InvestorLayout } from "./InvestorLayout";

interface KYCRecord {
  documentType: string;
  documentImage: string;
  extractedNumber: string;
  status: "Verified" | "Pending" | "Rejected"; // strict typing
}

export const KYCStatus = () => {
  const [kyc, setKyc] = useState<KYCRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get<KYCRecord>(
          "http://localhost:5000/api/kyc/status",
          { withCredentials: true }
        );
        setKyc(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load KYC status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="animate-spin w-6 h-6 text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center text-red-600">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <InvestorLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
          <ShieldCheck className="w-6 h-6 text-green-600" /> KYC Status
        </h2>

        {kyc ? (
          <div className="bg-white p-6 rounded-2xl shadow max-w-md space-y-3">
            <p>
              <strong>Document Type:</strong> {kyc.documentType}
            </p>
            <p>
              <strong>Document Number:</strong> {kyc.extractedNumber}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded-md text-sm ${
                  kyc.status === "Verified"
                    ? "bg-green-100 text-green-700"
                    : kyc.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {kyc.status}
              </span>
            </p>
            <div>
              <img
                src={kyc.documentImage}
                alt="KYC Document"
                className="w-full border rounded-lg mt-2"
              />
            </div>
          </div>
        ) : (
          <p>No KYC record found.</p>
        )}
      </div>
    </InvestorLayout>
  );
};
