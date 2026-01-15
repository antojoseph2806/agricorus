import { useEffect, useState } from "react";
import axios from "axios";
import VendorLayout from "../VendorLayout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface ChartData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

interface TopProduct {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
  images?: string[];
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  buyerName: string;
  total: number;
  status: string;
  createdAt: string;
}

const SalesAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    averageOrderValue: 0,
    conversionRate: 0
  });
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    revenue: [],
    orders: []
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("30"); // days

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const [metricsRes, chartRes, productsRes, ordersRes] = await Promise.all([
        axios.get(`${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/metrics?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/chart?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/top-products?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/recent-orders?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (chartRes.data.success) setChartData(chartRes.data.data);
      if (productsRes.data.success) setTopProducts(productsRes.data.data);
      if (ordersRes.data.success) setRecentOrders(ordersRes.data.data);

    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Sales Analytics</h1>
              <p className="text-gray-600">Track your business performance and growth metrics.</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(metrics.revenueGrowth)}`}>
                {getGrowthIcon(metrics.revenueGrowth)}
                <span>{Math.abs(metrics.revenueGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${getGrowthColor(metrics.ordersGrowth)}`}>
                {getGrowthIcon(metrics.ordersGrowth)}
                <span>{Math.abs(metrics.ordersGrowth).toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.totalOrders.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(metrics.averageOrderValue)}
            </div>
            <div className="text-sm text-gray-600">Average Order Value</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-2">
                {chartData.revenue.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t-sm min-h-[4px] transition-all duration-300 hover:bg-blue-600"
                      style={{
                        height: `${Math.max((value / Math.max(...chartData.revenue)) * 200, 4)}px`
                      }}
                      title={`${chartData.labels[index]}: ${formatCurrency(value)}`}
                    />
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                      {chartData.labels[index]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Orders Trend</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-2">
                {chartData.orders.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 rounded-t-sm min-h-[4px] transition-all duration-300 hover:bg-green-600"
                      style={{
                        height: `${Math.max((value / Math.max(...chartData.orders)) * 200, 4)}px`
                      }}
                      title={`${chartData.labels[index]}: ${value} orders`}
                    />
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                      {chartData.labels[index]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No product data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{product.totalSold} sold</span>
                        <span>{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Orders</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                      <div className="text-sm text-gray-600">{order.buyerName}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(order.total)}</div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default SalesAnalyticsDashboard;