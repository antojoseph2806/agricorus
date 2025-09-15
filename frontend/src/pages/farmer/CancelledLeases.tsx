// src/pages/CancelledLeases.tsx
import React, { useEffect, useState } from "react";
import { XCircleIcon, PhotoIcon } from "@heroicons/react/24/solid";

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
          "http://localhost:5000/api/farmer/leases/cancelled",
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading cancelled leases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
            <h1 className="text-xl font-bold text-gray-800">Cancelled Leases</h1>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            These are the lease agreements that have been cancelled
          </p>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No cancelled leases</h3>
            <p className="text-gray-500">
              Great! You don't have any cancelled lease agreements.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden"
              >
                {/* Changes made here */}
                <div className="flex flex-col">
                  {/* Image Section */}
                  <div className="relative w-full h-48 sm:h-64 flex-shrink-0">
                    {lease.land?.landPhotos?.length ? (
                      <img
                        src={lease.land.landPhotos[0]}
                        alt={lease.land.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                        <PhotoIcon className="h-12 w-12 mb-2" />
                        <span className="text-sm">No image available</span>
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                      <XCircleIcon className="h-3 w-3 mr-1" />
                      Cancelled
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800 mb-2">
                          {lease.land?.title || "Untitled Land"}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                          {lease.land?.location?.address || "No address provided"}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Size</p>
                            <p className="text-sm font-medium text-gray-800">
                              {lease.land?.sizeInAcres || "N/A"} acres
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                            <p className="text-sm font-medium text-gray-800">
                              {lease.land?.soilType || "N/A"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-sm font-medium text-gray-800">
                              {lease.durationMonths} months
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-sm">
                            <p className="text-xs text-gray-500 mb-1">Price</p>
                            <p className="text-sm font-medium text-gray-800">
                              ₹{lease.pricePerMonth}/month
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium">Owner:</span> {lease.owner?.email}
                          </p>
                          <p>
                            <span className="font-medium">Contact:</span> {lease.owner?.phone || "N/A"}
                          </p>
                          {lease.updatedAt && (
                            <p>
                              <span className="font-medium">Cancelled On:</span>{" "}
                              {new Date(lease.updatedAt).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
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