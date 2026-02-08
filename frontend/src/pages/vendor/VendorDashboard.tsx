import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorLayout from "../vendor/VendorLayout";
import InventoryWidget from "../../components/vendor/InventoryWidget";
import { 
  Package, 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Settings,
  BarChart3,
  Truck,
  Loader2,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface VendorInfo {
  businessName: string;
  kycStatus: "Pending" | "Approved" | "Rejected";
  ownerName?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [orderStats, setOrderStats] = useState<OrderStats>({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch vendor profile to get KYC status
      const [profileRes, productsRes, ordersRes] = await Promise.allSettled([
        axios.get("https://agricorus.onrender.com/api/vendor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://agricorus.onrender.com/api/vendor/products?isActive=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://agricorus.onrender.com/api/vendor/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Handle profile response
      if (profileRes.status === "fulfilled" && profileRes.value.data.success) {
        const profileData = profileRes.value.data.data;
        if (profileData) {
          // Map KYC status from VendorProfile model
          let kycStatus: "Pending" | "Approved" | "Rejected" = "Pending";
          if (profileData.kycStatus === "VERIFIED") kycStatus = "Approved";
          else if (profileData.kycStatus === "REJECTED") kycStatus = "Rejected";
          else if (profileData.kycStatus === "SUBMITTED") kycStatus = "Pending";
          
          setVendor({
            businessName: profileData.businessName || "Vendor",
            ownerName: profileData.ownerName,
            kycStatus,
          });
        } else {
          // No profile yet, try to get from token/localStorage
          const storedVendor = localStorage.getItem("vendorInfo");
          if (storedVendor) {
            const parsed = JSON.parse(storedVendor);
            setVendor({
              businessName: parsed.businessName || "Vendor",
              kycStatus: parsed.kycStatus || "Pending",
            });
          } else {
            setVendor({ businessName: "Vendor", kycStatus: "Pending" });
          }
        }
      } else {
        // Fallback to stored vendor info
        const storedVendor = localStorage.getItem("vendorInfo");
        if (storedVendor) {
          const parsed = JSON.parse(storedVendor);
          setVendor({
            businessName: parsed.businessName || "Vendor",
            kycStatus: parsed.kycStatus || "Pending",
          });
        } else {
          setVendor({ businessName: "Vendor", kycStatus: "Pending" });
        }
      }

      // Handle products response
      if (productsRes.status === "fulfilled" && productsRes.value.data.success) {
        setProductCount(productsRes.value.data.data.length);
      }

      // Handle orders response
      if (ordersRes.status === "fulfilled" && ordersRes.value.data.success) {
        const orders = ordersRes.value.data.data || [];
        setOrderStats({
          total: orders.length,
          pending: orders.filter((o: any) => o.status === "pending" || o.status === "processing").length,
          completed: orders.filter((o: any) => o.status === "delivered").length,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getKycStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
        return { color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, label: "Verified" };
      case "Rejected":
        return { color: "text-red-600", bg: "bg-red-50", icon: XCircle, label: "Rejected" };
      default:
        return { color: "text-amber-600", bg: "bg-amber-50", icon: Clock, label: "Pending" };
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </VendorLayout>
    );
  }

  const kycConfig = getKycStatusConfig(vendor?.kycStatus || "Pending");
  const KycIcon = kycConfig.icon;

  return (
    <VendorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-gray-700">{vendor?.businessName}</span>
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* KYC Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${kycConfig.bg} rounded-xl flex items-center justify-center`}>
                <KycIcon className={`w-6 h-6 ${kycConfig.color}`} />
              </div>
              <span className={`text-xs ${kycConfig.bg} ${kycConfig.color} px-2.5 py-1 rounded-full font-medium`}>
                KYC
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Verification Status</p>
            <p className={`text-xl font-bold ${kycConfig.color}`}>{kycConfig.label}</p>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">Products Listed</p>
            <p className="text-xl font-bold text-gray-800">{productCount}</p>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              {orderStats.pending > 0 && (
                <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-medium">
                  {orderStats.pending} pending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-xl font-bold text-gray-800">{orderStats.total}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Widget */}
          <div className="lg:col-span-1">
            <InventoryWidget />
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/vendor/products/add")}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Plus className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Add Products</h4>
                    <p className="text-sm text-gray-500">List fertilizers, tools & equipment</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/vendor/products")}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Manage Products</h4>
                    <p className="text-sm text-gray-500">Update stock & pricing</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/vendor/inventory")}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-amber-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">Inventory Control</h4>
                    <p className="text-sm text-gray-500">Monitor stock levels & alerts</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/vendor/orders")}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800">View Orders</h4>
                    <p className="text-sm text-gray-500">Track farmer orders & delivery</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Alert Banner (if not verified) */}
        {vendor?.kycStatus !== "Approved" && (
          <div className={`mt-6 rounded-2xl p-4 flex items-center gap-4 ${
            vendor?.kycStatus === "Rejected" ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              vendor?.kycStatus === "Rejected" ? "bg-red-100" : "bg-amber-100"
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                vendor?.kycStatus === "Rejected" ? "text-red-600" : "text-amber-600"
              }`} />
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${
                vendor?.kycStatus === "Rejected" ? "text-red-800" : "text-amber-800"
              }`}>
                {vendor?.kycStatus === "Rejected" 
                  ? "KYC Verification Rejected" 
                  : "KYC Verification Pending"}
              </p>
              <p className={`text-sm ${
                vendor?.kycStatus === "Rejected" ? "text-red-600" : "text-amber-600"
              }`}>
                {vendor?.kycStatus === "Rejected"
                  ? "Please update your documents and resubmit for verification."
                  : "Complete your KYC to unlock all vendor features."}
              </p>
            </div>
            <button
              onClick={() => navigate("/vendor/profile")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                vendor?.kycStatus === "Rejected"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {vendor?.kycStatus === "Rejected" ? "Resubmit KYC" : "Complete KYC"}
            </button>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorDashboard;
