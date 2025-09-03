// src/pages/AcceptedLeases.tsx
import React, { useEffect, useState } from "react";
import { CheckCircleIcon, CurrencyRupeeIcon } from "@heroicons/react/24/solid";

// Add Razorpay types
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
        const res = await fetch("http://localhost:5000/api/farmer/leases/accepted", {
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
        console.error("Error fetching accepted leases", err);
        setLeases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedLeases();
  }, []);

  // 🔹 Handle Payment with Razorpay
  const handlePayment = async (leaseId: string) => {
    try {
      const token = localStorage.getItem("token");

      // Step 1: Create Razorpay order
      const res = await fetch(`http://localhost:5000/api/payments/order/${leaseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderData = await res.json();
      if (!res.ok) {
        alert("Error creating payment order: " + orderData.error);
        return;
      }

      // Step 2: Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AgriCorus",
        description: "Lease Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          const verifyRes = await fetch(`http://localhost:5000/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
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
            setLeases((prev) =>
              prev.map((l) => (l._id === leaseId ? { ...l, status: "active" } : l))
            );
          } else {
            alert("❌ Payment verification failed: " + verifyData.error);
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Something went wrong while processing payment.");
    }
  };

  if (loading) {
    return <p className="p-8 text-lg text-gray-600">Loading accepted leases...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Accepted Leases</h1>

      {leases.length === 0 ? (
        <p className="text-lg text-gray-500">No accepted leases found.</p>
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
                    alt={lease.land.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                    No Image Available
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-4 right-4 bg-green-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
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
                      Size: <span className="font-normal">{lease.land?.sizeInAcres} acres</span>
                    </p>
                    <p className="font-medium">
                      Soil: <span className="font-normal">{lease.land?.soilType}</span>
                    </p>
                    <p className="font-medium">
                      Water: <span className="font-normal">{lease.land?.waterSource}</span>
                    </p>
                    <p className="font-medium">
                      Accessibility: <span className="font-normal">{lease.land?.accessibility}</span>
                    </p>
                    <p className="font-medium">
                      Duration: <span className="font-normal">{lease.durationMonths} months</span>
                    </p>
                    <p className="font-medium">
                      Price: <span className="font-normal">₹{lease.pricePerMonth} / month</span>
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
                      <span className="font-medium">Requested On:</span>
                      <span>{new Date(lease.createdAt).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>

                {/* 🔹 Payment Button */}
                {lease.status === "accepted" && (
                  <div className="mt-4">
                    <button
                      onClick={() => handlePayment(lease._id)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                      Make Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedLeases;
