import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  FileCheck, 
  Shield, 
  CreditCard,
  ChevronDown,
  Sparkles,
  Eye,
  X,
  FileText,
  Lock
} from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);

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
      setResponse(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
      setResponse(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResponse(null);
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
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Verify Your Identity</h1>
              <p className="text-gray-500">Complete KYC verification to unlock all features</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Document Verification</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Upload a clear image of your identity document</p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Document Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    Select Document Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDocumentType('Aadhaar')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        documentType === 'Aadhaar'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          documentType === 'Aadhaar' ? 'bg-emerald-500' : 'bg-gray-100'
                        }`}>
                          <CreditCard className={`w-5 h-5 ${
                            documentType === 'Aadhaar' ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold ${
                            documentType === 'Aadhaar' ? 'text-emerald-700' : 'text-gray-700'
                          }`}>Aadhaar Card</p>
                          <p className="text-xs text-gray-500">12-digit UID</p>
                        </div>
                      </div>
                      {documentType === 'Aadhaar' && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocumentType('PAN')}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        documentType === 'PAN'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          documentType === 'PAN' ? 'bg-emerald-500' : 'bg-gray-100'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            documentType === 'PAN' ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className={`font-semibold ${
                            documentType === 'PAN' ? 'text-emerald-700' : 'text-gray-700'
                          }`}>PAN Card</p>
                          <p className="text-xs text-gray-500">10-char alphanumeric</p>
                        </div>
                      </div>
                      {documentType === 'PAN' && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* File Upload Area */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    Upload Document
                  </label>
                  
                  {!previewUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300 bg-gray-50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                          isDragging ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                          <Upload className={`w-8 h-8 ${
                            isDragging ? 'text-emerald-500' : 'text-gray-400'
                          }`} />
                        </div>
                        <p className="text-gray-700 font-medium mb-1">
                          {isDragging ? 'Drop your file here' : 'Drag & drop your document'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          Supports JPG, PNG, PDF
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-50">
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        className="w-full h-64 object-contain bg-white"
                      />
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="flex items-center gap-2 text-white">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium">{selectedFile?.name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying Document...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Submit for Verification
                    </>
                  )}
                </button>

                {/* Success Message */}
                {response && (
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800">{response.message}</p>
                      {response.extractedNumber && (
                        <p className="text-sm text-emerald-600 mt-1">
                          Extracted {response.documentType}: <span className="font-mono">{response.extractedNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800">Verification Failed</p>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Why KYC Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6" />
                <h3 className="font-bold text-lg">Why KYC?</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-50">Unlock full investment features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-50">Secure your transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-50">Comply with regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-50">Enable faster withdrawals</span>
                </li>
              </ul>
            </div>

            {/* Security Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Your Data is Safe</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your documents are encrypted and stored securely. We follow strict data protection guidelines and never share your information with third parties.
              </p>
            </div>

            {/* Tips Card */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-3">📸 Tips for Upload</h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li>• Ensure all corners are visible</li>
                <li>• Avoid glare and shadows</li>
                <li>• Use good lighting</li>
                <li>• Keep the document flat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </InvestorLayout>
  );
};
