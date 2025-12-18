import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Droplet,
  Route,
  Ruler,
  Phone,
  Mail,
  Calendar,
  Clock,
  Server,
  Cloud,
  Shield,
  Cpu,
  type LucideIcon,
} from "lucide-react";
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
  const backendUrl =
    (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000";
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState<
    "idle" | "pending" | "approved" | "cancelled" | "rejected"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Type the icons so TS knows they are React components (defined once)
  const techIcons: LucideIcon[] = [Server, Cloud, Shield, Cpu];

  // Uppercase component variable (must be declared before conditional returns to avoid hook order issues)
  const RandomTechIcon = useMemo<LucideIcon>(() => {
    return techIcons[Math.floor(Math.random() * techIcons.length)];
  }, [techIcons]);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendUrl}/api/farmer/lands/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  }, [id, backendUrl]);

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
        `${backendUrl}/api/farmer/leases/${id}/request`,
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-red-500/25"></div>
          <p className="text-gray-300 font-medium font-poppins text-lg">
            Loading land details...
          </p>
          <p className="text-gray-500 text-sm mt-2 font-inter">
            Accessing agricultural network
          </p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-6xl text-gray-500/30 mb-4">🏞️</div>
          <h3 className="text-2xl font-bold text-white font-poppins uppercase tracking-wide mb-4">
            Land Not Found
          </h3>
          <p className="text-gray-400 font-inter text-lg">
            The requested land details could not be loaded from our network.
          </p>
          {error && (
            <p className="text-red-300 mt-2 text-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const actionDisabled =
    requesting ||
    leaseStatus === "pending" ||
    leaseStatus === "approved" ||
    land.status !== "available";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <div className="h-10 w-1 bg-emerald-500 mr-4 rounded-full"></div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {land.title}
                </h1>
                <p className="text-gray-600 mt-2">
                  Complete technical specifications for this agricultural land.
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
              <div
                className={`w-2 h-2 rounded-full ${
                  land.status === "available"
                    ? "bg-emerald-500"
                    : land.status === "leased"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm text-gray-700 font-medium">
                {land.status.toUpperCase()} •{" "}
                {land.isApproved ? "Verified" : "Pending Verification"}
              </span>
            </div>
        </motion.div>

        {/* Images Gallery */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {land.landPhotos && land.landPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {land.landPhotos.map((photo, idx) => (
                <motion.div
                  key={idx}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 220 }}
                  onClick={() => setSelectedImage(photo)}
                >
                  <img
                    src={photo}
                    alt={`Land photo ${idx + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                    View {idx + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-300">
              <MapPin className="w-10 h-10 text-gray-300" />
              <span className="ml-3 text-gray-500">
                No images available for this land yet.
              </span>
            </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Land Details */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Land Specifications
              </h2>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <RandomTechIcon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: MapPin,
                  label: "Location Address",
                  value: land.location.address,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Droplet,
                  label: "Water Source",
                  value: land.waterSource || "Not specified",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Ruler,
                  label: "Land Size",
                  value: `${land.sizeInAcres || "N/A"} acres`,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: Route,
                  label: "Accessibility",
                  value: land.accessibility || "Not specified",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: Calendar,
                  label: "Lease Duration",
                  value: `${land.leaseDurationMonths} months`,
                  color: "from-orange-500 to-red-500",
                },
                {
                  icon: Shield,
                  label: "Soil Type",
                  value: land.soilType,
                  color: "from-yellow-500 to-orange-500",
                  special: true,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="p-2 rounded-md bg-emerald-50 mr-3">
                      <item.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing & Action Sidebar */}
          <motion.div
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-white font-poppins uppercase tracking-wide mb-6 pb-3 border-b border-white/10">
              Lease Configuration
            </h2>

            {/* Pricing Card */}
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Monthly Rate
                </span>
                <span className="text-2xl font-bold text-emerald-700">
                  ₹{land.leasePricePerMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>
                  Total for {land.leaseDurationMonths} months
                </span>
                <span className="font-semibold">
                  ₹
                  {(
                    land.leasePricePerMonth * land.leaseDurationMonths
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Owner Information */}
            {land.owner && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Owner Contact
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                    <span>{land.owner.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                    <span>{land.owner.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <motion.button
              onClick={handleLeaseRequest}
              disabled={actionDisabled}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                actionDisabled
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              }`}
              whileHover={actionDisabled ? undefined : { scale: 1.02 }}
            >
              {requesting ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Processing Request...</span>
                </div>
              ) : leaseStatus === "pending" ? (
                "Request Pending"
              ) : leaseStatus === "approved" ? (
                "Lease Active"
              ) : land.status !== "available" ? (
                "Not Available"
              ) : (
                "Request Lease"
              )}
            </motion.button>

            {/* Status Messages */}
            {message && (
              <motion.div
                className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-xl border border-green-500/30 text-sm font-inter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div
                className="mt-4 p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 rounded-xl border border-red-500/30 text-sm font-inter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-800/30 p-2 rounded-lg">
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-poppins">
                    Size
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {land.sizeInAcres || "N/A"} acres
                  </div>
                </div>
                <div className="bg-gray-800/30 p-2 rounded-lg">
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-poppins">
                    Duration
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {land.leaseDurationMonths} mo
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="max-w-4xl max-h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-2 border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="w-full h-full object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FarmerLandDetail;
