// src/pages/PublicLandDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, MapPin, Droplet, Route, Ruler, X } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

interface Owner {
  _id: string;
  email: string;
  phone: string;
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
  owner?: Owner; // Backend populates this
  currentUserLease?: {
    _id: string;
    status: "pending" | "approved" | "cancelled" | "rejected";
  };
}

const PublicLandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState<
    "idle" | "pending" | "approved" | "cancelled" | "rejected"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const backendUrl =
    (import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com";

  /** -------------------- Check Authentication & Role -------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  /** -------------------- Fetch Land Details -------------------- */
  useEffect(() => {
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(
          `${backendUrl}/api/farmer/lands/public/${id}`,
          { headers }
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
  }, [id, backendUrl]);

  /** -------------------- Handle Lease Request Button Click -------------------- */
  const handleLeaseRequestClick = () => {
    if (!isAuthenticated || userRole !== "farmer") {
      setShowAuthModal(true);
      return;
    }
    handleLeaseRequest();
  };

  /** -------------------- Handle Lease Request -------------------- */
  const handleLeaseRequest = async () => {
    if (!id || !land) return;

    setRequesting(true);
    setMessage(null);
    setError(null);

    if (leaseStatus === "pending") {
      setMessage("You already have a pending availability check for this land.");
      setRequesting(false);
      return;
    }
    if (leaseStatus === "approved") {
      setMessage("You already have an approved lease for this land.");
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
        setMessage("Availability check submitted successfully. The landowner will review your request.");
      } else {
        setError(data.error || "Failed to check land availability.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  /** -------------------- Loading State -------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader className="w-10 h-10 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  /** -------------------- Land Not Found -------------------- */
  if (!land) {
    return (
      <motion.p
        className="text-center text-gray-600 mt-10 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Land not found.
      </motion.p>
    );
  }

  /** -------------------- Main Land Detail Page -------------------- */
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50 py-10 pt-24">
        <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <motion.h1
          className="text-4xl font-extrabold text-gray-900 mb-6 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {land.title}
        </motion.h1>

        {/* Images */}
        <motion.div
          className={`mb-8 ${
            land.landPhotos?.length === 1
              ? "flex justify-center"
              : "grid grid-cols-1 sm:grid-cols-2 gap-6"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {land.landPhotos && land.landPhotos.length > 0 ? (
            land.landPhotos.map((photo, idx) => (
              <motion.img
                key={idx}
                src={photo}
                alt={`Land photo ${idx + 1}`}
                className={`${
                  land.landPhotos.length === 1
                    ? "w-full max-w-3xl h-96 object-cover rounded-2xl shadow-lg"
                    : "w-full h-72 object-cover rounded-2xl shadow-lg cursor-pointer"
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-72 bg-gray-100 rounded-lg">
              <MapPin className="w-14 h-14 text-gray-400" />
            </div>
          )}
        </motion.div>

        {/* Land Details */}
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-emerald-700">
            Land Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <span className="font-semibold">📍 Address:</span>{" "}
              {land.location.address}
            </p>
            <p>
              <span className="font-semibold">🌱 Soil Type:</span>{" "}
              {land.soilType}
            </p>
            <p>
              <span className="font-semibold">💰 Lease Price:</span> ₹
              {land.leasePricePerMonth.toLocaleString()}/month
            </p>
            <p>
              <span className="font-semibold">⏳ Duration:</span>{" "}
              {land.leaseDurationMonths} months
            </p>
            {land.waterSource && (
              <p className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Water Source:</span>{" "}
                {land.waterSource}
              </p>
            )}
            {land.accessibility && (
              <p className="flex items-center gap-2">
                <Route className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Accessibility:</span>{" "}
                {land.accessibility}
              </p>
            )}
            {land.sizeInAcres && (
              <p className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Size:</span>{" "}
                {land.sizeInAcres} acres
              </p>
            )}
          </div>
        </motion.div>

        {/* Owner Info */}
        {land.owner && (
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-emerald-700">
              Owner Information
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold">📧 Email:</span>{" "}
                {land.owner.email || "N/A"}
              </p>
              <p>
                <span className="font-semibold">📞 Phone:</span>{" "}
                {land.owner.phone || "N/A"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Lease Request */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <button
            onClick={handleLeaseRequestClick}
            disabled={
              (isAuthenticated && userRole === "farmer" && requesting) ||
              leaseStatus === "pending" ||
              leaseStatus === "approved" ||
              land.status !== "available"
            }
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition ${
              (isAuthenticated && userRole === "farmer" && requesting) ||
              leaseStatus === "pending" ||
              leaseStatus === "approved" ||
              land.status !== "available"
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {leaseStatus === "pending"
              ? "Availability Pending"
              : leaseStatus === "approved"
              ? "Lease Approved"
              : leaseStatus === "cancelled" || leaseStatus === "rejected"
              ? "Check Land Availability"
              : "Check Land Availability"}
          </button>

          {message && (
            <p className="mt-4 text-green-600 font-medium">{message}</p>
          )}
          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </motion.div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAuthModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isAuthenticated && userRole !== "farmer" 
                  ? "Farmer Account Required" 
                  : "Authentication Required"}
              </h2>
              <p className="text-gray-600">
                {isAuthenticated && userRole !== "farmer"
                  ? "To check land availability and request a lease, you need to be logged in as a farmer."
                  : "To check land availability and request a lease, you need to register as a farmer and login."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAuthenticated && userRole !== "farmer" ? (
                <>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate("/register");
                    }}
                    className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-md"
                  >
                    Register as Farmer
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate("/login");
                    }}
                    className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-emerald-600 font-semibold rounded-xl transition border-2 border-emerald-600"
                  >
                    Login as Farmer
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-md"
                  >
                    Register as Farmer
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-emerald-600 font-semibold rounded-xl transition border-2 border-emerald-600"
                  >
                    Login to Farmer Account
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              {isAuthenticated && userRole !== "farmer"
                ? "You're currently logged in as a different user type. Please logout and login as a farmer."
                : "Already have a farmer account? Click 'Login' to access your dashboard."}
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default PublicLandDetail;
