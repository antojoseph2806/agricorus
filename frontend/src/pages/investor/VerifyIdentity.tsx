import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { InvestorLayout } from "./InvestorLayout";

interface KYCResponse {
  message: string;
  documentType?: string;
  extractedNumber?: string;
  kycId?: string;
  documentUrl?: string;
}

export const VerifyIdentity: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<'Aadhaar' | 'PAN'>('Aadhaar');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<KYCResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview selected image
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(selectedFile);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a document image.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not logged in. Please login first.');

      const res = await axios.post('http://localhost:5000/api/kyc/verify', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setResponse(res.data);
    } catch (err: any) {
      console.error(err.response || err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Something went wrong while submitting KYC.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <InvestorLayout>
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* File Input */}
        <div>
          <label className="block mb-1 font-medium">Upload Document</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 w-full h-48 object-contain border rounded" />}
        </div>

        {/* Document Type */}
        <div>
          <label className="block mb-1 font-medium">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as 'Aadhaar' | 'PAN')}
            className="w-full border p-2 rounded"
          >
            <option value="Aadhaar">Aadhaar</option>
            <option value="PAN">PAN</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          Submit KYC
        </button>

        {/* Success / Error Messages */}
        {response && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 p-2 rounded">
            <CheckCircle />
            <span>{response.message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-2 rounded">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Optional: Display extracted info */}
      {response && response.extractedNumber && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p><strong>Document Type:</strong> {response.documentType}</p>
          <p><strong>Extracted Number:</strong> {response.extractedNumber}</p>
          {response.documentUrl && (
            <img src={response.documentUrl} alt="Uploaded Document" className="mt-2 w-full h-48 object-contain border rounded" />
          )}
        </div>
      )}
    </div>
    </InvestorLayout>
  );
};
