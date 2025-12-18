import React, { useEffect, useState } from "react";
import { CheckCircle, IndianRupee, Image as ImageIcon, MapPin, Calendar, User, Phone, Mail } from "lucide-react";

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

  // Handle Payment with Razorpay
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
          color: "#059669",
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Leases</h1>
              <p className="text-gray-600 mt-1">Your approved land lease agreements ready for activation</p>
            </div>
          </div>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Leases</h3>
            <p className="text-gray-600">You don't have any approved lease agreements at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {leases.map((lease) => (
              <div
                key={lease._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Section */}
                <div className="w-full h-48 relative flex-shrink-0">
                  {lease.land?.landPhotos?.length ? (
                    <img
                      src={lease.land.landPhotos[0]}
                      alt={lease.land.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {lease.status.toUpperCase()}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {lease.land?.title || "Untitled Lease"}
                      </h2>
                      
                      <div className="flex items-start text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          {lease.land?.location?.address || "No address provided"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Size</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.land?.sizeInAcres || "N/A"} acres
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Soil Type</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.land?.soilType || "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {lease.durationMonths} months
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Price</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{lease.pricePerMonth}/mo
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-2 pb-4 border-b border-gray-200">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-900 mr-2">Owner:</span>
                          {lease.owner?.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-900 mr-2">Contact:</span>
                          {lease.owner?.phone || "N/A"}
                        </div>
                        {lease.createdAt && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-900 mr-2">Created:</span>
                            {new Date(lease.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Button */}
                    {lease.status === "accepted" && (
                      <div className="mt-4">
                        <button
                          onClick={() => handlePayment(lease._id)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                          <IndianRupee className="h-5 w-5 mr-2" />
                          Activate Lease
                        </button>
                      </div>
                    )}

                    {lease.status === "active" && (
                      <div className="mt-4">
                        <div className="w-full flex items-center justify-center px-4 py-3 bg-emerald-100 text-emerald-800 font-semibold rounded-lg">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Lease Active
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {leases.length > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center bg-white rounded-lg px-6 py-3 border shadow-sm">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
              <span className="text-gray-600 text-sm font-medium">
                Displaying <span className="text-gray-900 font-semibold">{leases.length}</span> active lease{leases.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptedLeases;
