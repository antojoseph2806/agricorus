// src/pages/FarmerLandDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader, MapPin, Droplet, Route, Ruler } from "lucide-react";
import { motion } from "framer-motion";

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
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [leaseStatus, setLeaseStatus] = useState<
    "idle" | "pending" | "approved" | "cancelled" | "rejected"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** -------------------- Fetch Land Details -------------------- */
  useEffect(() => {
    const fetchLand = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/farmer/lands/public/${id}`,
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

  /** -------------------- Handle Lease Request -------------------- */
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-emerald-50 py-10">
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
            onClick={handleLeaseRequest}
            disabled={
              requesting ||
              leaseStatus === "pending" ||
              leaseStatus === "approved" ||
              land.status !== "available"
            }
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition ${
              requesting ||
              leaseStatus === "pending" ||
              leaseStatus === "approved" ||
              land.status !== "available"
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {leaseStatus === "pending"
              ? "Request Pending"
              : leaseStatus === "approved"
              ? "Lease Approved"
              : leaseStatus === "cancelled" || leaseStatus === "rejected"
              ? "Re-request Lease"
              : "Request for Lease"}
          </button>

          {message && (
            <p className="mt-4 text-green-600 font-medium">{message}</p>
          )}
          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </motion.div>
      </div>
    </div>
  );
};

export default PublicLandDetail;
