import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Droplet, Route, Ruler, Phone, Mail, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Owner {
  _id: string;
  email: string;
  phone: string;
  name?: string;
}

interface Land {
  _id: string;
  title: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  soilType: string;
  leasePricePerMonth: number;
  leaseDurationMonths: number;
  landPhotos: string[];
  status: string;
  isApproved: boolean;
  waterSource?: string;
  accessibility?: string;
  sizeInAcres?: number;
  owner?: Owner;
  currentUserLease?: {
    _id: string;
    status: "pending" | "approved" | "cancelled" | "rejected";
  };
}

const FarmerLandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState<
    "idle" | "pending" | "approved" | "cancelled" | "rejected"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/farmer/lands/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch land details");
        const data: Land = await res.json();
        setLand(data);

        if (data.currentUserLease) setLeaseStatus(data.currentUserLease.status);
      } catch (err) {
        console.error(err);
        setError("Failed to load land details.");
      } finally {
        setLoading(false);
      }
    };

    fetchLand();
  }, [id]);

  const handleLeaseRequest = async () => {
    if (!id || !land) return;

    setRequesting(true);
    setMessage(null);
    setError(null);

    if (leaseStatus === "pending") {
      setMessage("You already have a pending lease request.");
      setRequesting(false);
      return;
    }
    if (leaseStatus === "approved") {
      setMessage("You already have an approved lease.");
      setRequesting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/farmer/leases/${id}/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setLeaseStatus("pending");
        setMessage("Lease request submitted successfully. Awaiting approval.");
      } else {
        setError(data.error || "Failed to submit lease request.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading land details...</p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl text-gray-300 mb-4">🏞️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Land not found</h3>
          <p className="text-gray-500">The requested land details could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center">
            <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{land.title}</h1>
              <p className="text-gray-600 text-sm">Complete details about this agricultural land</p>
            </div>
          </div>
        </motion.div>

        {/* Images */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {land.landPhotos && land.landPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {land.landPhotos.map((photo, idx) => (
                <motion.div
                  key={idx}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => setSelectedImage(photo)}
                >
                  <img
                    src={photo}
                    alt={`Land photo ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-sm shadow-sm border border-gray-200"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-sm border border-gray-200">
              <MapPin className="w-12 h-12 text-gray-400" />
              <span className="ml-2 text-gray-500">No images available</span>
            </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Land Details */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-sm shadow-sm p-5 border border-gray-200"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Land Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 bg-blue-50 rounded-sm">
                <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-800">{land.location.address}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-sm">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-sm mr-3"></div>
                <div>
                  <p className="text-xs text-gray-500">Soil Type</p>
                  <p className="text-sm font-medium text-gray-800">{land.soilType}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-sm">
                <Ruler className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="text-sm font-medium text-gray-800">
                    {land.sizeInAcres || "N/A"} acres
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-sm">
                <Droplet className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Water Source</p>
                  <p className="text-sm font-medium text-gray-800">
                    {land.waterSource || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-sm">
                <Route className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Accessibility</p>
                  <p className="text-sm font-medium text-gray-800">
                    {land.accessibility || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 rounded-sm">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Lease Duration</p>
                  <p className="text-sm font-medium text-gray-800">
                    {land.leaseDurationMonths} months
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pricing & Action Sidebar */}
          <motion.div
            className="bg-white rounded-sm shadow-sm p-5 border border-gray-200"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Pricing & Lease
            </h2>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Monthly Rate</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{land.leasePricePerMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total for {land.leaseDurationMonths} months</span>
                <span className="font-medium">
                  ₹{(land.leasePricePerMonth * land.leaseDurationMonths).toLocaleString()}
                </span>
              </div>
            </div>

            {land.owner && (
              <div className="mb-6 p-4 bg-gray-50 rounded-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Owner Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{land.owner.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{land.owner.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLeaseRequest}
              disabled={
                requesting ||
                leaseStatus === "pending" ||
                leaseStatus === "approved" ||
                land.status !== "available"
              }
              className={`w-full py-3 rounded-sm font-medium transition-colors ${
                requesting ||
                leaseStatus === "pending" ||
                leaseStatus === "approved" ||
                land.status !== "available"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {requesting ? (
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : leaseStatus === "pending" ? (
                "Request Pending"
              ) : leaseStatus === "approved" ? (
                "Lease Approved"
              ) : (
                "Request Lease"
              )}
            </button>

            {message && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-sm text-sm">
                {message}
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-sm text-sm">
                {error}
              </div>
            )}
          </motion.div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl max-h-full">
              <img src={selectedImage} alt="Enlarged view" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerLandDetail;