import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout } from './LandownerDashboard';

interface KycStatusResponse {
  documentType: string;
  status: string;
  documentImage: string;
  extractedNumber: string;
  createdAt: string;
  rejectionReason?: string;
  verifiedAt?: string;
}

const KycStatus: React.FC = () => {
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get<KycStatusResponse>(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus(data);
      } catch (error: any) {
        setMessage(error.response?.data?.message || 'Failed to load KYC status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // Loading Screen
  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px] bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Loading KYC Status...</p>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              KYC Verification
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Secure identity verification powered by advanced document recognition technology
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Verification Status
                </h2>
                {status && (
                  <div
                    className={`px-6 py-2 rounded-full font-semibold text-sm ${
                      status.status === 'approved' || status.status === 'Verified'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : status.status === 'rejected' || status.status === 'Rejected'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {status.status}
                  </div>
                )}
              </div>

              {/* If error message */}
              {message ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">{message}</p>
                </div>
              ) : status ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left side - Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 border">
                      <h3 className="text-gray-900 font-semibold text-sm mb-4">
                        Document Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-gray-500 text-sm font-medium">
                            Document Type
                          </label>
                          <p className="text-gray-900 text-lg font-semibold mt-1">{status.documentType}</p>
                        </div>
                        <div>
                          <label className="text-gray-500 text-sm font-medium">
                            Document Number
                          </label>
                          <p className="text-gray-900 text-lg font-semibold mt-1 font-mono">
                            {status.extractedNumber}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-500 text-sm font-medium">
                            Submitted At
                          </label>
                          <p className="text-gray-900 font-medium mt-1">
                            {new Date(status.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 border">
                      <h3 className="text-gray-900 font-semibold text-sm mb-4">
                        Verification Progress
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              status.status === 'approved' || status.status === 'Verified'
                                ? 'bg-green-500 w-full'
                                : status.status === 'rejected' || status.status === 'Rejected'
                                ? 'bg-red-500 w-full'
                                : 'bg-yellow-500 w-2/3'
                            }`}
                          ></div>
                        </div>
                        <span className="text-gray-900 text-sm font-semibold">
                          {status.status === 'pending' || status.status === 'Pending' ? 'In Review' : status.status}
                        </span>
                      </div>
                      
                      {/* Show rejection reason if rejected */}
                      {(status.status === 'rejected' || status.status === 'Rejected') && status.rejectionReason && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="text-red-700 font-semibold text-sm mb-2">Rejection Reason:</h4>
                          <p className="text-red-600 text-sm">{status.rejectionReason}</p>
                        </div>
                      )}
                      
                      {/* Show verified date if approved */}
                      {(status.status === 'approved' || status.status === 'Verified') && status.verifiedAt && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-green-700 font-semibold text-sm mb-2">Verified On:</h4>
                          <p className="text-green-600 text-sm">{new Date(status.verifiedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Document Image */}
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <h3 className="text-gray-900 font-semibold text-sm mb-4">
                      Document Preview
                    </h3>
                    <div className="relative group">
                      <img
                        src={status.documentImage}
                        alt="KYC Document"
                        className="w-full h-64 object-contain rounded-lg border-2 border-gray-200 transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <button
                          onClick={() => {
                            setSelectedImage(status.documentImage);
                            setIsModalOpen(true);
                          }}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-emerald-700"
                        >
                          View Full Size
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs text-center mt-3">
                      Click to view document in full resolution
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 text-xl font-bold mb-2">No KYC Record Found</h3>
                  <p className="text-gray-600 mb-6">You haven't submitted any KYC documents yet.</p>
                  <button className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300">
                    Start KYC Verification
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extra Info */}
          {status && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  title: 'Secure & Encrypted',
                  desc: 'Your documents are protected with enterprise-grade encryption',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  ),
                },
                {
                  title: '24-48 Hour Review',
                  desc: 'Typical verification process takes 1-2 business days',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                },
                {
                  title: 'Automated Processing',
                  desc: 'AI-powered document verification for faster results',
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <h4 className="text-gray-900 font-semibold text-sm mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for full-size image */}
      {isModalOpen && selectedImage && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-emerald-600 rounded-full p-2 hover:bg-emerald-700"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Full Size Document"
              className="w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-200"
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default KycStatus;
