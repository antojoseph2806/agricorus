import React, { useEffect, useState } from "react";
import { XCircle, Image as ImageIcon, MapPin, Calendar, Mail, Phone, Archive } from "lucide-react";

interface Lease {
  _id: string;
  land?: {
    title?: string;
    location?: { address?: string };
    sizeInAcres?: number;
    soilType?: string;
    landPhotos?: string[];
  };
  owner?: { email?: string; phone?: string };
  durationMonths: number;
  pricePerMonth: number;
  status: string;
  updatedAt?: string;
}

const CancelledLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCancelledLeases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://agricorus.onrender.com/api/farmer/leases/cancelled", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLeases(Array.isArray(data) ? data : data.leases || []);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-gray-800 text-xl font-semibold mb-2">Loading Leases</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
              <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Cancelled Leases</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Review your terminated lease agreements</p>
            </div>
          </div>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-8 sm:p-12 text-center">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Cancelled Leases</h3>
            <p className="text-sm sm:text-base text-gray-600">All your leases are currently active or pending.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {leases.map((lease) => (
              <div key={lease._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border hover:shadow-md transition-all">
                <div className="w-full h-40 sm:h-48 relative">
                  {lease.land?.landPhotos?.length ? (
                    <img src={lease.land.landPhotos[0]} alt={lease.land.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                      <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2" />
                      <span className="text-xs sm:text-sm text-gray-500">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-100 text-red-800 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full flex items-center">
                    <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    CANCELLED
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1">{lease.land?.title || "Untitled"}</h2>
                  <div className="flex items-start text-gray-600 mb-3 sm:mb-4">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-sm line-clamp-2">{lease.land?.location?.address || "No address"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border">
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">Size</p>
                      <p className="text-xs sm:text-sm font-semibold">{lease.land?.sizeInAcres || "N/A"} acres</p>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border">
                      <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">Duration</p>
                      <p className="text-xs sm:text-sm font-semibold">{lease.durationMonths} months</p>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 pb-3 sm:pb-4 border-b">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">{lease.owner?.email}</span>
                    </div>
                    {lease.updatedAt && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                        {new Date(lease.updatedAt).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-red-100 text-red-800 font-semibold rounded-lg text-xs sm:text-sm">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Lease Cancelled
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelledLeases;
