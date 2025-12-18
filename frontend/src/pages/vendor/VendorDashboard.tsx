import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorLayout from "../vendor/VendorLayout";

interface VendorInfo {
  businessName: string;
  kycStatus: "Pending" | "Approved" | "Rejected";
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorInfo>({
    businessName: "Vendor",
    kycStatus: "Pending"
  });
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
    fetchProductCount();
  }, []);

  const fetchVendorData = async () => {
    // Later: fetch vendor profile using token
    // For now: placeholder
    setVendor({
      businessName: "GreenGrow Agro",
      kycStatus: "Pending"
    });
  };

  const fetchProductCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/vendor/products?isActive=true",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setProductCount(res.data.data.length);
      }
    } catch (error: any) {
      console.error("Error fetching product count:", error);
    } finally {
      setLoading(false);
    }
  };

  const kycColor =
    vendor.kycStatus === "Approved"
      ? "text-green-600"
      : vendor.kycStatus === "Rejected"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <VendorLayout>
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Vendor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, <span className="font-semibold">{vendor.businessName}</span>
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">KYC Status</h3>
            <p className={`text-xl font-bold mt-2 ${kycColor}`}>
              {vendor.kycStatus}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Products Listed</h3>
            <p className="text-xl font-bold mt-2 text-gray-800">
              {loading ? "..." : productCount}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Orders Received</h3>
            <p className="text-xl font-bold mt-2 text-gray-800">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/vendor/products/add")}
              className="border rounded-lg p-4 text-left hover:bg-green-50 transition"
            >
              <h4 className="font-semibold text-green-700">Add Products</h4>
              <p className="text-sm text-gray-600 mt-1">
                List fertilizers, tools & equipment
              </p>
            </button>

            <button
              onClick={() => navigate("/vendor/products")}
              className="border rounded-lg p-4 text-left hover:bg-green-50 transition"
            >
              <h4 className="font-semibold text-green-700">Manage Products</h4>
              <p className="text-sm text-gray-600 mt-1">
                Update stock & pricing
              </p>
            </button>

            <button className="border rounded-lg p-4 text-left hover:bg-green-50 transition">
              <h4 className="font-semibold text-green-700">View Orders</h4>
              <p className="text-sm text-gray-600 mt-1">
                Track farmer orders & delivery
              </p>
            </button>

            <button className="border rounded-lg p-4 text-left hover:bg-green-50 transition">
              <h4 className="font-semibold text-green-700">Payments</h4>
              <p className="text-sm text-gray-600 mt-1">
                Escrow & payment history
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
       </VendorLayout>
  );
};

export default VendorDashboard;
