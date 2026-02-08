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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mr-4">
              <Archive className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cancelled Leases</h1>
              <p className="text-gray-600 mt-1">Review your terminated lease agreements</p>
            </div>
          </div>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cancelled Leases</h3>
            <p className="text-gray-600">All your leases are currently active or pending.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <div key={lease._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all">
                <div className="w-full h-48 relative">
                  {lease.land?.landPhotos?.length ? (
                    <img src={lease.land.landPhotos[0]} alt={lease.land.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">No image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    CANCELLED
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{lease.land?.title || "Untitled"}</h2>
                  <div className="flex items-start text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <p className="text-sm">{lease.land?.location?.address || "No address"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">Size</p>
                      <p className="text-sm font-semibold">{lease.land?.sizeInAcres || "N/A"} acres</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-xs text-gray-600 mb-1">Duration</p>
                      <p className="text-sm font-semibold">{lease.durationMonths} months</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-2 pb-4 border-b">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {lease.owner?.email}
                    </div>
                    {lease.updatedAt && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(lease.updatedAt).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-center px-4 py-3 bg-red-100 text-red-800 font-semibold rounded-lg">
                    <XCircle className="h-5 w-5 mr-2" />
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
