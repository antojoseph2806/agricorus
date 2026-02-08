import React, { useEffect, useState } from "react";
import { CheckCircle, IndianRupee, Image as ImageIcon, MapPin, Calendar, Phone, Mail, Maximize2, Layers, Clock } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  finalApproval?: string;
  createdAt?: string;
}

const AcceptedLeases: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptedLeases = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://agricorus.onrender.com/api/farmer/leases/accepted", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setLeases(data);
        else if (data.leases && Array.isArray(data.leases)) setLeases(data.leases);
        else setLeases([]);
      } catch (err) {
        console.error("Error fetching accepted leases", err);
        setLeases([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAcceptedLeases();
  }, []);

  const handlePayment = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://agricorus.onrender.com/api/payments/order/${leaseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = await res.json();
      if (!res.ok) {
        alert("Error creating payment order: " + orderData.error);
        return;
      }
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AgriCorus",
        description: "Lease Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(`https://agricorus.onrender.com/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              leaseId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("✅ Payment Successful!");
            setLeases((prev) => prev.map((l) => (l._id === leaseId ? { ...l, status: "active" } : l)));
          } else {
            alert("❌ Payment verification failed: " + verifyData.error);
          }
        },
        theme: { color: "#059669" },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Something went wrong while processing payment.");
    }
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Accepted Leases</h1>
                <p className="text-gray-600 text-sm">Your approved land lease agreements ready for activation</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg">
              <span className="text-emerald-700 font-semibold text-lg">{leases.length}</span>
              <span className="text-emerald-600 text-sm">Total Leases</span>
            </div>
          </div>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Accepted Leases</h3>
            <p className="text-gray-600">You don't have any approved lease agreements at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {leases.map((lease) => (
              <div key={lease._id} className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group">
                {/* Compact Image with Overlay Info */}
                <div className="relative h-40">
                  {lease.land?.landPhotos?.length ? (
                    <img src={lease.land.landPhotos[0]} alt={lease.land.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-emerald-300" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center shadow-lg">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {lease.status.toUpperCase()}
                  </div>
                  {/* Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="text-white font-bold text-lg leading-tight line-clamp-1 drop-shadow-lg">
                      {lease.land?.title || "Untitled Lease"}
                    </h2>
                    <div className="flex items-center text-white/90 text-xs mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="line-clamp-1">{lease.land?.location?.address || "No address"}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Content */}
                <div className="p-4">
                  {/* Quick Stats Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Maximize2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-sm font-medium">{lease.land?.sizeInAcres || "N/A"} acres</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Layers className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-sm font-medium">{lease.land?.soilType || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-sm font-medium">{lease.durationMonths} mo</span>
                    </div>
                  </div>

                  {/* Price Highlight */}
                  <div className="bg-emerald-50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
                    <span className="text-emerald-700 text-sm font-medium">Monthly Rent</span>
                    <span className="text-emerald-700 font-bold text-lg">₹{lease.pricePerMonth?.toLocaleString()}</span>
                  </div>

                  {/* Owner Info - Compact */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{lease.owner?.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{lease.owner?.phone || "N/A"}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {lease.status === "accepted" && (
                    <button onClick={() => handlePayment(lease._id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 text-sm">
                      <IndianRupee className="h-4 w-4" />
                      Activate Lease
                    </button>
                  )}
                  {lease.status === "active" && (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Lease Active
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptedLeases;
