import React, { useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface Lease {
  _id: string;
  land?: {
    title?: string;
    location?: { address?: string };
    sizeInAcres?: number;
    soilType?: string;
    waterSource?: string;
    accessibility?: string;
    leasePricePerMonth?: number;
    leaseDurationMonths?: number;
    landPhotos?: string[];
  };
  owner?: { email?: string; phone?: string };
  durationMonths: number;
  pricePerMonth: number;
  status: string;
  createdAt?: string;
}

const ActiveLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveLeases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/farmer/leases/active", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          setLeases(data);
        } else if (data.leases && Array.isArray(data.leases)) {
          setLeases(data.leases);
        } else {
          setLeases([]);
        }
      } catch (err) {
        console.error("Error fetching active leases", err);
        setLeases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLeases();
  }, []);

  if (loading) {
    return <p className="p-8 text-lg text-gray-600">Loading active leases...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Active Leases</h1>

      {leases.length === 0 ? (
        <p className="text-lg text-gray-500">No active leases found.</p>
      ) : (
        <div className="space-y-6">
          {leases.map((lease) => (
            <div
              key={lease._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row border border-gray-100"
            >
              {/* Image Section */}
              <div className="relative w-full h-56 md:w-80 md:h-auto flex-shrink-0">
                {lease.land?.landPhotos?.length ? (
                  <img
                    src={lease.land.landPhotos[0]}
                    alt={lease.land?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    No Image Available
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 right-4 bg-blue-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{lease.status}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {lease.land?.title || "Untitled Land"}
                  </h2>
                  <p className="text-base text-gray-600 mb-4">
                    {lease.land?.location?.address}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
                    <p className="font-medium">
                      Size:{" "}
                      <span className="font-normal">{lease.land?.sizeInAcres} acres</span>
                    </p>
                    <p className="font-medium">
                      Soil: <span className="font-normal">{lease.land?.soilType}</span>
                    </p>
                    <p className="font-medium">
                      Water: <span className="font-normal">{lease.land?.waterSource}</span>
                    </p>
                    <p className="font-medium">
                      Accessibility:{" "}
                      <span className="font-normal">{lease.land?.accessibility}</span>
                    </p>
                    <p className="font-medium">
                      Duration:{" "}
                      <span className="font-normal">{lease.durationMonths} months</span>
                    </p>
                    <p className="font-medium">
                      Price:{" "}
                      <span className="font-normal">₹{lease.pricePerMonth} / month</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4 text-sm text-gray-500 space-y-1">
                  <p className="flex items-center space-x-2">
                    <span className="font-medium">Owner:</span>
                    <span>{lease.owner?.email}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span className="font-medium">Contact:</span>
                    <span>{lease.owner?.phone}</span>
                  </p>
                  {lease.createdAt && (
                    <p className="flex items-center space-x-2">
                      <span className="font-medium">Activated On:</span>
                      <span>{new Date(lease.createdAt).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveLeases;
