import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Layout } from './LandownerDashboard';

interface ApiResponse {
  message: string;
  documentType?: string;
  extractedNumber?: string;
  kycId?: string;
  documentUrl?: string;
}

const KycVerify: React.FC = () => {
  const [documentType, setDocumentType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file || !documentType) {
      setMessage('Please select document type and file');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    try {
      setLoading(true);
      setMessage('');
      const token = localStorage.getItem('token');

      const { data } = await axios.post<ApiResponse>(
        'http://localhost:5000/api/kyc/verify',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage(data.message);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Identity Verification
            </h1>
            <p className="text-gray-600 text-sm">
              Secure KYC process with advanced encryption
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Verify Your Identity
              </h2>
              <p className="text-gray-600 text-sm">
                Upload your government-issued document for verification
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <label htmlFor="documentType" className="block text-gray-700 text-sm font-medium">
                  Document Type
                </label>
                <select
                  id="documentType"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="">Select Document Type</option>
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                </select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label htmlFor="document" className="block text-gray-700 text-sm font-medium">
                  Upload Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="document"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-gray-500 text-xs">
                  Supported formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {/* Security Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-green-700 text-sm font-medium">
                  Your documents are encrypted and securely stored
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Verification...</span>
                  </div>
                ) : (
                  'Verify Identity'
                )}
              </button>
            </form>

            {/* Status Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg text-center ${
                message.includes('failed') || message.includes('Please select') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-900 text-sm font-semibold">256-bit Encryption</h3>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-900 text-sm font-semibold">Instant Processing</h3>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-gray-900 text-sm font-semibold">Secure Storage</h3>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KycVerify;