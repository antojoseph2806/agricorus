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
  RefreshCw,
  AlertCircle,
  BarChart3,
  Activity,
  Maximize2,
  X
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
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [chartModal, setChartModal] = useState<{ open: boolean; type: 'revenue' | 'orders' | null }>({ 
    open: false, 
    type: null 
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const [metricsRes, chartRes, productsRes, ordersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/metrics?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/chart?period=${selectedPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/top-products?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/recent-orders?limit=5`, {
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
      currency: 'INR',
      maximumFractionDigits: 0
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

  const ChartComponent = ({ 
    data, 
    labels, 
    type, 
    color,
    isModal = false 
  }: { 
    data: number[]; 
    labels: string[]; 
    type: 'revenue' | 'orders';
    color: string;
    isModal?: boolean;
  }) => {
    const maxValue = Math.max(...data, 1);
    const chartHeight = isModal ? 'h-96' : 'h-48';
    
    const labelInterval = data.length <= 7 ? 1 : data.length <= 30 ? Math.ceil(data.length / 10) : Math.ceil(data.length / 12);
    
    return (
      <div className={chartHeight}>
        <div className={`${isModal ? 'h-80' : 'h-40'} flex items-end justify-between gap-1 px-2`}>
          {data.map((value, index) => {
            const heightPercent = (value / maxValue) * 100;
            const showLabel = index % labelInterval === 0 || index === data.length - 1;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative min-w-0">
                <div
                  className={`w-full ${color} rounded-t transition-all duration-200 cursor-pointer min-h-[2px]`}
                  style={{ height: `${Math.max(heightPercent, 1)}%` }}
                >
                  <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-20 shadow-lg">
                    <div className="font-semibold mb-1">{labels[index]}</div>
                    <div className="text-gray-200">
                      {type === 'revenue' ? formatCurrency(value) : `${value} ${value === 1 ? 'order' : 'orders'}`}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                {showLabel && (
                  <div className={`${isModal ? 'text-xs' : 'text-[9px]'} text-gray-500 mt-2 text-center leading-tight truncate w-full`}>
                    {labels[index]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-2">
          <span className="font-medium">{labels[0]}</span>
          <span className="font-medium">{labels[labels.length - 1]}</span>
        </div>
      </div>
    );
  };

  const ChartModal = () => {
    if (!chartModal.open || !chartModal.type) return null;

    const isRevenue = chartModal.type === 'revenue';
    const data = isRevenue ? chartData.revenue : chartData.orders;
    const title = isRevenue ? 'Revenue Trend' : 'Orders Trend';
    const color = isRevenue ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-green-600 to-green-400';
    const icon = isRevenue ? DollarSign : ShoppingCart;
    const Icon = icon;

    const totalValue = data.reduce((sum, val) => sum + val, 0);
    const avgValue = data.length > 0 ? totalValue / data.length : 0;
    const maxValue = Math.max(...data, 0);
    const minValue = Math.min(...data.filter(v => v > 0), 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${isRevenue ? 'bg-blue-100' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${isRevenue ? 'text-blue-600' : 'text-green-600'}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">
                  {selectedPeriod === '7' ? 'Last 7 days' : 
                   selectedPeriod === '30' ? 'Last 30 days' : 
                   selectedPeriod === '90' ? 'Last 3 months' : 'Last year'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setChartModal({ open: false, type: null })}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Total</div>
                <div className="text-xl font-bold text-gray-900">
                  {isRevenue ? formatCurrency(totalValue) : totalValue}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Average</div>
                <div className="text-xl font-bold text-gray-900">
                  {isRevenue ? formatCurrency(avgValue) : Math.round(avgValue)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Peak</div>
                <div className="text-xl font-bold text-gray-900">
                  {isRevenue ? formatCurrency(maxValue) : maxValue}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Lowest</div>
                <div className="text-xl font-bold text-gray-900">
                  {isRevenue ? formatCurrency(minValue) : minValue}
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <ChartComponent
                data={data}
                labels={chartData.labels}
                type={chartModal.type}
                color={color}
                isModal={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              </div>
              <button
                onClick={() => setChartModal({ open: true, type: 'revenue' })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand chart"
              >
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : chartData.revenue.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No revenue data available</p>
                </div>
              </div>
            ) : (
              <ChartComponent
                data={chartData.revenue}
                labels={chartData.labels}
                type="revenue"
                color="bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Orders Trend</h3>
              </div>
              <button
                onClick={() => setChartModal({ open: true, type: 'orders' })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Expand chart"
              >
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : chartData.orders.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No order data available</p>
                </div>
              </div>
            ) : (
              <ChartComponent
                data={chartData.orders}
                labels={chartData.labels}
                type="orders"
                color="bg-gradient-to-t from-green-600 to-green-400 hover:from-green-700 hover:to-green-500"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <ChartModal />
    </VendorLayout>
  );
};

export default SalesAnalyticsDashboard;
