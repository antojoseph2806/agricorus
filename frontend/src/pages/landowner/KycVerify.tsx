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
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] py-8 px-4">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 font-['Poppins']">
              Identity Verification
            </h1>
            <p className="text-gray-300 text-sm font-['Inter']">
              Secure KYC process with advanced encryption
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 hover:scale-[1.02] transition-transform duration-300 ease-in-out">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-2 font-['Montserrat']">
                Verify Your Identity
              </h2>
              <p className="text-gray-300 text-sm font-['Inter']">
                Upload your government-issued document for verification
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <label htmlFor="documentType" className="block text-white text-sm font-medium font-['Inter'] uppercase tracking-wide">
                  Document Type
                </label>
                <select
                  id="documentType"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 font-['Inter']"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="" className="bg-gray-800">Select Document Type</option>
                  <option value="Aadhaar" className="bg-gray-800">Aadhaar Card</option>
                  <option value="PAN" className="bg-gray-800">PAN Card</option>
                </select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label htmlFor="document" className="block text-white text-sm font-medium font-['Inter'] uppercase tracking-wide">
                  Upload Document
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="document"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-['Inter']"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-gray-400 text-xs font-['Inter']">
                  Supported formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-green-400 text-sm font-['Inter'] font-medium">
                  Your documents are encrypted and securely stored
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-red-500/30 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-['Inter'] uppercase tracking-wide"
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
              <div className={`mt-6 p-4 rounded-xl text-center font-['Inter'] ${
                message.includes('failed') || message.includes('Please select') 
                  ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
                  : 'bg-green-500/20 border border-green-500/30 text-green-300'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-bold font-['Inter']">256-bit Encryption</h3>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-bold font-['Inter']">Instant Processing</h3>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white text-sm font-bold font-['Inter']">Secure Storage</h3>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KycVerify;