import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Layout } from '../Layout';

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface ChartData {
  month: string;
  revenue: number;
  orders: number;
}

const SalesOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sales-analytics/overview?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setChartData(data.chartData);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/sales-analytics/download?type=overview&period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-overview-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

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
              <TrendingUp className="w-4 h-4 mr-1" />
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% from last period
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
            <h1 className="text-2xl font-bold text-gray-900">Sales Analytics Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your marketplace performance and trends</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={downloadReport}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Revenue"
                value={metrics.totalRevenue}
                icon={DollarSign}
                growth={metrics.revenueGrowth}
                prefix="₹"
              />
              <MetricCard
                title="Total Orders"
                value={metrics.totalOrders}
                icon={ShoppingCart}
                growth={metrics.orderGrowth}
              />
              <MetricCard
                title="Total Customers"
                value={metrics.totalCustomers}
                icon={Users}
              />
              <MetricCard
                title="Average Order Value"
                value={metrics.averageOrderValue}
                icon={BarChart3}
                prefix="₹"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-emerald-500 rounded-t w-full transition-all duration-300 hover:bg-emerald-600"
                        style={{
                          height: `${(data.revenue / Math.max(...chartData.map(d => d.revenue))) * 200}px`,
                          minHeight: '4px'
                        }}
                        title={`₹${data.revenue.toLocaleString()}`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Trend</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                        style={{
                          height: `${(data.orders / Math.max(...chartData.map(d => d.orders))) * 200}px`,
                          minHeight: '4px'
                        }}
                        title={`${data.orders} orders`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                        {data.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-700">View Monthly Reports</span>
                </button>
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <BarChart3 className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-700">Product Performance</span>
                </button>
                <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                  <span className="text-gray-700">Revenue Analysis</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SalesOverview;