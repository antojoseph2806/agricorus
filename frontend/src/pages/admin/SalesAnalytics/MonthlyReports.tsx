import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Layout } from '../Layout';

interface MonthlyData {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  revenueGrowth: number;
  orderGrowth: number;
}

const MonthlyReports: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://agricorus.duckdns.org/api/admin/sales-analytics/monthly?month=${selectedMonth + 1}&year=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMonthlyData(data);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadMonthlyReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://agricorus.duckdns.org/api/admin/sales-analytics/download?type=monthly&month=${selectedMonth + 1}&year=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-report-${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading monthly report:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentData = monthlyData.find(data => 
    data.month === monthNames[selectedMonth] && data.year === selectedYear
  );

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    growth?: number;
    prefix?: string;
  }> = ({ title, value, icon: Icon, growth, prefix = '' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {growth !== undefined && (
            <p className={`text-sm mt-2 flex items-center ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {growth >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-emerald-50 rounded-full">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Sales Reports</h1>
            <p className="text-gray-600 mt-1">Detailed monthly performance analysis</p>
          </div>
          <button
            onClick={downloadMonthlyReport}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition mt-4 sm:mt-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </button>
        </div>

        {/* Month Navigation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-emerald-600 transition"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : currentData ? (
          <>
            {/* Monthly Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Monthly Revenue"
                value={currentData.revenue}
                icon={DollarSign}
                growth={currentData.revenueGrowth}
                prefix="₹"
              />
              <MetricCard
                title="Total Orders"
                value={currentData.orders}
                icon={ShoppingCart}
                growth={currentData.orderGrowth}
              />
              <MetricCard
                title="Active Customers"
                value={currentData.customers}
                icon={Users}
              />
              <MetricCard
                title="Average Order Value"
                value={currentData.averageOrderValue}
                icon={Package}
                prefix="₹"
              />
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Units Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sales.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{product.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Month-over-Month Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Revenue Growth</span>
                    <span className={`text-sm font-semibold ${
                      currentData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentData.revenueGrowth >= 0 ? '+' : ''}{currentData.revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Order Growth</span>
                    <span className={`text-sm font-semibold ${
                      currentData.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentData.orderGrowth >= 0 ? '+' : ''}{currentData.orderGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Products Sold</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {currentData.products.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Avg. Order Value</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{currentData.averageOrderValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              No sales data found for {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MonthlyReports;