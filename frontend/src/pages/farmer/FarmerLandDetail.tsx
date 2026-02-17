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
    import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org";
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            Loading land details...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Fetching property information
          </p>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-md">
          <div className="text-6xl mb-6">🏞️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Land Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The requested land details could not be loaded.
          </p>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 px-4 py-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header with Gradient */}
        <motion.div
          className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Icon Badge */}
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {land.title}
                  </h1>
                  <p className="text-emerald-50 text-sm">
                    Complete technical specifications for this agricultural land
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <div
                  className={`w-2 h-2 rounded-full ${
                    land.status === "available"
                      ? "bg-green-400"
                      : land.status === "leased"
                      ? "bg-red-400"
                      : "bg-yellow-400"
                  }`}
                ></div>
                <span className="text-sm text-white font-medium">
                  {land.status.toUpperCase()} •{" "}
                  {land.isApproved ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Images Gallery */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {land.landPhotos && land.landPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {land.landPhotos.map((photo, idx) => (
                <motion.div
                  key={idx}
                  className="group relative cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => setSelectedImage(photo)}
                >
                  <img
                    src={photo}
                    alt={`Land photo ${idx + 1}`}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg">
                    View {idx + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <MapPin className="w-12 h-12 text-gray-300 mb-2" />
              <span className="text-gray-500 text-sm">
                No images available for this land yet
              </span>
            </div>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Land Details */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Land Specifications
              </h2>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl shadow-sm">
                <RandomTechIcon className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: MapPin,
                  label: "Location Address",
                  value: land.location.address,
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Droplet,
                  label: "Water Source",
                  value: land.waterSource || "Not specified",
                  gradient: "from-cyan-500 to-teal-500",
                },
                {
                  icon: Ruler,
                  label: "Land Size",
                  value: `${land.sizeInAcres || "N/A"} acres`,
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: Route,
                  label: "Accessibility",
                  value: land.accessibility || "Not specified",
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  icon: Calendar,
                  label: "Lease Duration",
                  value: `${land.leaseDurationMonths} months`,
                  gradient: "from-orange-500 to-red-500",
                },
                {
                  icon: Shield,
                  label: "Soil Type",
                  value: land.soilType,
                  gradient: "from-amber-500 to-orange-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="group relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.gradient} shadow-sm`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                        {item.label}
                      </span>
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing & Action Sidebar */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 mb-6 -mx-6 -mt-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                Lease Configuration
              </h2>
            </div>

            {/* Pricing Card */}
            <div className="mb-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                    Monthly Rate
                  </span>
                  <span className="text-3xl font-bold text-emerald-700">
                    ₹{land.leasePricePerMonth.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 font-medium">
                    Total ({land.leaseDurationMonths} months)
                  </span>
                  <span className="font-bold text-emerald-700 text-lg">
                    ₹
                    {(
                      land.leasePricePerMonth * land.leaseDurationMonths
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            {land.owner && (
              <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Owner Contact
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{land.owner.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{land.owner.phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200">
                <div className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-1">
                  Size
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {land.sizeInAcres || "N/A"} acres
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                <div className="text-xs text-purple-700 font-semibold uppercase tracking-wide mb-1">
                  Duration
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {land.leaseDurationMonths} mo
                </div>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              onClick={handleLeaseRequest}
              disabled={actionDisabled}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                actionDisabled
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg"
              }`}
              whileHover={actionDisabled ? undefined : { scale: 1.02 }}
              whileTap={actionDisabled ? undefined : { scale: 0.98 }}
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
                className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div
                className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="max-w-5xl max-h-[90vh] bg-white rounded-2xl p-3 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="w-full h-full object-contain rounded-xl"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FarmerLandDetail;
