// src/pages/CancelledLeases.tsx
import React, { useEffect, useState } from "react";
import { XCircleIcon, PhotoIcon, DocumentTextIcon, MapPinIcon, CalendarIcon } from "@heroicons/react/24/solid";

interface Lease {
  _id: string;
  land?: {
    title?: string;
    location?: {
      address?: string;
    };
    sizeInAcres?: number;
    soilType?: string;
    waterSource?: string;
    accessibility?: string;
    leasePricePerMonth?: number;
    leaseDurationMonths?: number;
    landPhotos?: string[];
  };
  owner?: {
    email?: string;
    phone?: string;
  };
  durationMonths: number;
  pricePerMonth: number;
  status: string;
  finalApproval?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CancelledLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCancelledLeases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://agricorus.onrender.com/api/farmer/leases/cancelled",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setLeases(data);
        } else if (data.leases && Array.isArray(data.leases)) {
          setLeases(data.leases);
        } else {
          setLeases([]);
        }
      } catch (err) {
        console.error("Error fetching cancelled leases", err);
        setLeases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCancelledLeases();
  }, []);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative overflow-hidden"
        style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-2">LOADING ARCHIVES</h3>
          <p className="text-gray-300 font-light">Retrieving cancelled deployments</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] p-4 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-8 shadow-2xl">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">ARCHIVED DEPLOYMENTS</h1>
              <div className="w-16 h-1 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full mt-2"></div>
            </div>
          </div>
          <p className="text-gray-300 text-lg font-light max-w-2xl leading-relaxed">
            Review your terminated lease agreements and deployment history
          </p>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              <div className="text-4xl">✅</div>
            </div>
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-3">NO ARCHIVED DEPLOYMENTS</h3>
            <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
              Excellent! All your deployments are currently active or pending.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="group bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col shadow-lg"
              >
                {/* Image Section */}
                <div className="w-full h-48 relative flex-shrink-0">
                  {lease.land?.landPhotos?.length ? (
                    <img
                      src={lease.land.landPhotos[0]}
                      alt={lease.land.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-500/10 to-gray-700/10 flex flex-col items-center justify-center text-gray-400">
                      <PhotoIcon className="h-12 w-12 mb-3 text-white/40" />
                      <span className="text-white/60 text-sm">No image available</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-red-500/20 backdrop-blur-sm text-red-400 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full flex items-center border border-red-400/30">
                    <XCircleIcon className="h-3 w-3 mr-1.5" />
                    TERMINATED
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-3 line-clamp-2">
                        {lease.land?.title || "Untitled Deployment"}
                      </h2>
                      
                      <div className="flex items-center text-gray-300 mb-4">
                        <MapPinIcon className="h-4 w-4 mr-2 text-[#ff3b3b]" />
                        <p className="text-sm">
                          {lease.land?.location?.address || "No address provided"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Size</p>
                          <p className="text-sm font-bold text-white">
                            {lease.land?.sizeInAcres || "N/A"} acres
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Soil Type</p>
                          <p className="text-sm font-bold text-white">
                            {lease.land?.soilType || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Duration</p>
                          <p className="text-sm font-bold text-white">
                            {lease.durationMonths} months
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <p className="text-xs text-gray-300 uppercase tracking-wide mb-1">Price</p>
                          <p className="text-sm font-bold text-white">
                            ₹{lease.pricePerMonth}/month
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-300 space-y-2">
                        <div className="flex items-center">
                          <span className="font-bold text-white mr-2">Owner:</span>
                          {lease.owner?.email}
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold text-white mr-2">Contact:</span>
                          {lease.owner?.phone || "N/A"}
                        </div>
                        {lease.updatedAt && (
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-[#ff3b3b]" />
                            <span className="font-bold text-white mr-2">Terminated:</span>
                            {new Date(lease.updatedAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="w-full flex items-center justify-center px-6 py-4 bg-red-500/20 backdrop-blur-sm text-red-400 font-bold rounded-xl border border-red-400/30">
                        <XCircleIcon className="h-5 w-5 mr-3" />
                        DEPLOYMENT TERMINATED
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {leases.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-white/5 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
              <span className="text-gray-300 text-sm font-bold uppercase tracking-wide">
                Archived <span className="text-white">{leases.length}</span> Deployment{leases.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelledLeases;