import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Upload } from "lucide-react";

const FarmerKYCVerify: React.FC = () => {
  const [documentType, setDocumentType] = useState("Aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Backend URL (no .env needed)
  const API_URL = "http://localhost:5000"; // Change to your backend URL if hosted (e.g., Render/AWS)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload your document image");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_URL}/api/kyc/verify`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message || "KYC submitted successfully!");
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "KYC submission failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10">
      <h2 className="text-2xl font-semibold text-center mb-4">
        KYC Verification
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Type */}
        <div>
          <label className="block font-medium mb-1">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="border w-full rounded-lg p-2"
          >
            <option value="Aadhaar">Aadhaar</option>
            <option value="PAN">PAN</option>
          </select>
        </div>

        {/* Upload */}
        <div>
          <label className="block font-medium mb-1">Upload Document</label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-3 flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="w-60 h-40 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg flex justify-center items-center gap-2"
        >
          {loading ? "Verifying..." : <><Upload size={18} /> Submit KYC</>}
        </button>
      </form>
    </div>
  );
};

export default FarmerKYCVerify;
