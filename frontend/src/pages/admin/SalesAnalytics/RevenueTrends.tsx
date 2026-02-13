import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import { Layout } from '../Layout';

interface RevenueData {
  period: string;
  revenue: number;
  growth: number;
  orders: number;
  averageOrderValue: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
  growth: number;
}

interface VendorRevenue {
  vendorName: string;
  revenue: number;
  orders: number;
  commission: number;
}

const RevenueTrends: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([]);
  const [vendorData, setVendorData] = useState<VendorRevenue[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedView, setSelectedView] = useState('timeline');
  const [loading, setLoading] = useState(true);

  const periodOptions = [
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: '2years', label: 'Last 2 Years' },
  ];

  const viewOptions = [
    { value: 'timeline', label: 'Timeline View', icon: BarChart3 },
    { value: 'categories', label: 'By Categories', icon: PieChart },
    { value: 'vendors', label: 'By Vendors', icon: TrendingUp },
  ];

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/admin/sales-analytics/revenue?period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data.timeline);
        setCategoryData(data.categories);
        setVendorData(data.vendors);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRevenueReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/admin/sales-analytics/download?type=revenue&period=${selectedPeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-trends-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading revenue report:', error);
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const averageGrowth = revenueData.length > 0 
    ? revenueData.reduce((sum, item) => sum + item.growth, 0) / revenueData.length 
    : 0;

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  const renderTimelineView = () => (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Timeline</h3>
        <div className="h-80 flex items-end justify-between space-x-2">
          {revenueData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full">
                <div
                  className="bg-emerald-500 rounded-t w-full transition-all duration-300 hover:bg-emerald-600 cursor-pointer"
                  style={{
                    height: `${(data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 250}px`,
                    minHeight: '8px'
                  }}
                  title={`₹${data.revenue.toLocaleString()}`}
                ></div>
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                  getGrowthColor(data.growth)
                }`}>
                  {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-600 transform -rotate-45 origin-left whitespace-nowrap">
                  {data.period}
                </div>
                <div className="text-xs font-medium text-gray-900 mt-1">
                  ₹{(data.revenue / 1000).toFixed(0)}K
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Timeline Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Timeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {revenueData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{data.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center ${getGrowthColor(data.growth)}`}>
                      {getGrowthIcon(data.growth)}
                      <span className="ml-1">
                        {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.orders.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{data.averageOrderValue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCategoriesView = () => (
    <div className="space-y-6">
      {/* Category Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(category.revenue / Math.max(...categoryData.map(c => c.revenue))) * 200}px`,
                    minHeight: '8px'
                  }}
                  title={`₹${category.revenue.toLocaleString()}`}
                ></div>
                <div className="mt-2 text-center">
                  <div className="text-xs text-gray-600 transform -rotate-45 origin-left">
                    {category.category}
                  </div>
                  <div className="text-xs font-medium text-gray-900 mt-1">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{category.category}</div>
                  <div className="text-xs text-gray-500">
                    {category.percentage.toFixed(1)}% of total revenue
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{category.revenue.toLocaleString()}
                  </div>
                  <div className={`text-xs ${getGrowthColor(category.growth)}`}>
                    {category.growth >= 0 ? '+' : ''}{category.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVendorsView = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Revenue by Vendor</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Order Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendorData.map((vendor, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vendor.vendorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{vendor.revenue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vendor.orders.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{vendor.commission.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{(vendor.revenue / vendor.orders).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Trends</h1>
            <p className="text-gray-600 mt-1">Analyze revenue patterns and growth trends</p>
          </div>
          <button
            onClick={downloadRevenueReport}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition mt-4 sm:mt-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              {viewOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedView(option.value)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    selectedView === option.value
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Growth</p>
                    <p className={`text-2xl font-bold ${getGrowthColor(averageGrowth)}`}>
                      {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Period</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {periodOptions.find(p => p.value === selectedPeriod)?.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Content Based on Selected View */}
            {selectedView === 'timeline' && renderTimelineView()}
            {selectedView === 'categories' && renderCategoriesView()}
            {selectedView === 'vendors' && renderVendorsView()}
          </>
        )}
      </div>
    </Layout>
  );
};

export default RevenueTrends;