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
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState<
    "idle" | "pending" | "approved" | "cancelled" | "rejected"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Type the icons so TS knows they are React components
  const techIcons: LucideIcon[] = [Server, Cloud, Shield, Cpu];

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://agricorus.onrender.com/api/farmer/lands/${id}`, {
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
        `https://agricorus.onrender.com/api/farmer/leases/${id}/request`,
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
        </div>
      </div>
    );
  }

  // Uppercase component variable
  const RandomTechIcon = useMemo<LucideIcon>(() => {
    return techIcons[Math.floor(Math.random() * techIcons.length)];
  }, []); // choose once per mount

  const actionDisabled =
    requesting ||
    leaseStatus === "pending" ||
    leaseStatus === "approved" ||
    land.status !== "available";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl p-6 lg:p-8 mb-8 border border-white/10 backdrop-blur-sm overflow-hidden"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="h-10 w-1 bg-red-500 mr-4 rounded-full shadow-lg shadow-red-500/25"></div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white font-poppins uppercase tracking-wider">
                  {land.title}
                </h1>
                <p className="text-gray-300 font-inter text-lg mt-2">
                  Complete technical specifications for this agricultural land
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-white/10">
              <div
                className={`w-2 h-2 rounded-full ${
                  land.status === "available"
                    ? "bg-green-500 animate-pulse"
                    : land.status === "leased"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm text-gray-300 uppercase tracking-wide font-poppins">
                {land.status} • {land.isApproved ? "Verified" : "Pending Verification"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Images Gallery */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {land.landPhotos && land.landPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {land.landPhotos.map((photo, idx) => (
                <motion.div
                  key={idx}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  onClick={() => setSelectedImage(photo)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <img
                    src={photo}
                    alt={`Land photo ${idx + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                    View {idx + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-white/10 backdrop-blur-sm">
              <MapPin className="w-16 h-16 text-gray-500/30" />
              <span className="ml-4 text-gray-400 font-inter">
                No images available in database
              </span>
            </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Land Details */}
          <motion.div
            className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-poppins uppercase tracking-wide">
                Land Specifications
              </h2>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-xl">
                <RandomTechIcon className="w-5 h-5 text-white" />
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
                  className="group bg-gray-800/30 rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-r ${item.color} mr-3 shadow-lg`}
                    >
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-400 uppercase tracking-wide font-poppins">
                      {item.label}
                    </span>
                  </div>
                  <p
                    className={`text-lg font-semibold font-inter ${
                      item.special
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                        : "text-white"
                    }`}
                  >
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
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-300 uppercase tracking-wide font-poppins">
                  Monthly Rate
                </span>
                <span className="text-2xl font-bold text-white font-poppins">
                  ₹{land.leasePricePerMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  Total for {land.leaseDurationMonths} months
                </span>
                <span className="font-semibold text-gray-300">
                  ₹
                  {(
                    land.leasePricePerMonth * land.leaseDurationMonths
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Owner Information */}
            {land.owner && (
              <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-white/5">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3 font-poppins">
                  Owner Contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-300">
                    <Mail className="w-4 h-4 mr-3 text-red-400" />
                    <span className="font-inter">
                      {land.owner.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400 hover:text-white transition-colors duration-300">
                    <Phone className="w-4 h-4 mr-3 text-green-400" />
                    <span className="font-inter">
                      {land.owner.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <motion.button
              onClick={handleLeaseRequest}
              disabled={actionDisabled}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                actionDisabled
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                  : "bg-red-500 hover:bg-red-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 border border-red-400/50"
              }`}
              whileHover={actionDisabled ? undefined : { scale: 1.05 }}
            >
              {requesting ? (
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing Request...
                </div>
              ) : leaseStatus === "pending" ? (
                "⌛ Request Pending"
              ) : leaseStatus === "approved" ? (
                "✅ Lease Active"
              ) : land.status !== "available" ? (
                "❌ Not Available"
              ) : (
                "🚀 Request Lease"
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
