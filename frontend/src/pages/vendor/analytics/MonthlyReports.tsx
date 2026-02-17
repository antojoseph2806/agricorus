import { useEffect, useState } from "react";
import axios from "axios";
import VendorLayout from "../VendorLayout";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  FileText,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";

interface MonthlyData {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

const MonthlyReports = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/analytics/monthly-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear()
          }
        }
      );

      if (response.data.success) {
        setMonthlyData(response.data.data);
      } else {
        setError(response.data.message || "Failed to load monthly report");
      }
    } catch (err: any) {
      console.error("Monthly report fetch error:", err);
      setError(err.response?.data?.message || "Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: 'pdf' | 'excel') => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/analytics/download-monthly-report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
            format
          },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `monthly-report-${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      setError("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const currentMonth = months[selectedDate.getMonth()];
  const currentYear = selectedDate.getFullYear();

  return (
    <VendorLayout>
      <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Monthly Reports</h1>
              <p className="text-sm sm:text-base text-gray-600">Detailed monthly performance analysis and insights.</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <button
                onClick={fetchMonthlyReport}
                disabled={loading}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center gap-3 mb-4 sm:mb-6 text-sm sm:text-base">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Month Navigation */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="text-center min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{currentMonth} {currentYear}</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Monthly Performance Report</p>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              disabled={selectedDate >= new Date()}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Loading monthly report...</p>
          </div>
        ) : !monthlyData ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 sm:p-12 text-center">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm sm:text-base text-gray-500">No sales data found for {currentMonth} {currentYear}</p>
          </div>
        ) : (
          <>
            {/* Download Section */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Download Report</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Export your monthly report in different formats</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => downloadReport('pdf')}
                    disabled={downloading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => downloadReport('excel')}
                    disabled={downloading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${getGrowthColor(monthlyData.revenueGrowth)}`}>
                    {getGrowthIcon(monthlyData.revenueGrowth)}
                    <span>{Math.abs(monthlyData.revenueGrowth).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                  {formatCurrency(monthlyData.revenue)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Monthly Revenue</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${getGrowthColor(monthlyData.ordersGrowth)}`}>
                    {getGrowthIcon(monthlyData.ordersGrowth)}
                    <span>{Math.abs(monthlyData.ordersGrowth).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {monthlyData.orders.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Orders</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs sm:text-sm ${getGrowthColor(monthlyData.customersGrowth)}`}>
                    {getGrowthIcon(monthlyData.customersGrowth)}
                    <span>{Math.abs(monthlyData.customersGrowth).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {monthlyData.customers.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">New Customers</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                  {formatCurrency(monthlyData.averageOrderValue)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Order Value</div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Top Products This Month</h3>
              {monthlyData.topProducts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No product sales this month</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">Rank</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">Product Name</th>
                        <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">Units Sold</th>
                        <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 sm:px-4">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                              #{index + 1}
                            </div>
                          </td>
                          <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{product.name}</td>
                          <td className="py-3 px-2 sm:px-4 text-right text-gray-600 text-xs sm:text-sm">{product.sold}</td>
                          <td className="py-3 px-2 sm:px-4 text-right font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </VendorLayout>
  );
};

export default MonthlyReports;