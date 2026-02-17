import { useState } from "react";
import axios from "axios";
import VendorLayout from "../VendorLayout";
import {
  FileText,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

interface ReportConfig {
  name: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  groupBy: string;
  filters: {
    category?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  };
  format: 'pdf' | 'excel' | 'csv';
}

interface SavedReport {
  _id: string;
  name: string;
  config: ReportConfig;
  createdAt: string;
  lastGenerated?: string;
}

const CustomReports = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: "",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    metrics: ["revenue", "orders"],
    groupBy: "day",
    filters: {},
    format: "pdf"
  });
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableMetrics = [
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "customers", label: "Customers", icon: Users },
    { id: "products", label: "Products Sold", icon: Package },
    { id: "averageOrderValue", label: "Average Order Value", icon: TrendingUp },
    { id: "conversionRate", label: "Conversion Rate", icon: BarChart3 }
  ];

  const groupByOptions = [
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
    { value: "quarter", label: "Quarterly" },
    { value: "year", label: "Yearly" }
  ];

  const generateReport = async () => {
    if (!reportConfig.name.trim()) {
      setError("Please enter a report name");
      return;
    }

    if (reportConfig.metrics.length === 0) {
      setError("Please select at least one metric");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/analytics/generate-custom-report`,
        reportConfig,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = reportConfig.format === 'pdf' ? 'pdf' : reportConfig.format === 'excel' ? 'xlsx' : 'csv';
      link.setAttribute('download', `${reportConfig.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess("Report generated and downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Report generation error:", err);
      setError(err.response?.data?.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const saveReportConfig = async () => {
    if (!reportConfig.name.trim()) {
      setError("Please enter a report name");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/vendor/analytics/save-report-config`,
        reportConfig,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSavedReports([...savedReports, response.data.data]);
        setSuccess("Report configuration saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      console.error("Save config error:", err);
      setError(err.response?.data?.message || "Failed to save report configuration");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedReport = (report: SavedReport) => {
    setReportConfig(report.config);
  };

  const handleMetricToggle = (metricId: string) => {
    const updatedMetrics = reportConfig.metrics.includes(metricId)
      ? reportConfig.metrics.filter(m => m !== metricId)
      : [...reportConfig.metrics, metricId];
    
    setReportConfig({ ...reportConfig, metrics: updatedMetrics });
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Custom Reports</h1>
          <p className="text-gray-600">Create customized reports with specific metrics and date ranges.</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    value={reportConfig.name}
                    onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                    placeholder="Enter report name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={reportConfig.dateRange.start}
                      onChange={(e) => setReportConfig({
                        ...reportConfig,
                        dateRange: { ...reportConfig.dateRange, start: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={reportConfig.dateRange.end}
                      onChange={(e) => setReportConfig({
                        ...reportConfig,
                        dateRange: { ...reportConfig.dateRange, end: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                  <select
                    value={reportConfig.groupBy}
                    onChange={(e) => setReportConfig({ ...reportConfig, groupBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {groupByOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <select
                    value={reportConfig.format}
                    onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value as 'pdf' | 'excel' | 'csv' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metrics Selection */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMetrics.map(metric => (
                  <label key={metric.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={reportConfig.metrics.includes(metric.id)}
                      onChange={() => handleMetricToggle(metric.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <metric.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">{metric.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={reportConfig.filters.category || ""}
                    onChange={(e) => setReportConfig({
                      ...reportConfig,
                      filters: { ...reportConfig.filters, category: e.target.value }
                    })}
                    placeholder="Filter by category..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                  <select
                    value={reportConfig.filters.status || ""}
                    onChange={(e) => setReportConfig({
                      ...reportConfig,
                      filters: { ...reportConfig.filters, status: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={reportConfig.filters.minAmount || ""}
                    onChange={(e) => setReportConfig({
                      ...reportConfig,
                      filters: { ...reportConfig.filters, minAmount: Number(e.target.value) }
                    })}
                    placeholder="Minimum order amount..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={reportConfig.filters.maxAmount || ""}
                    onChange={(e) => setReportConfig({
                      ...reportConfig,
                      filters: { ...reportConfig.filters, maxAmount: Number(e.target.value) }
                    })}
                    placeholder="Maximum order amount..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateReport}
                  disabled={generating || !reportConfig.name.trim() || reportConfig.metrics.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {generating ? "Generating..." : "Generate & Download"}
                </button>
                <button
                  onClick={saveReportConfig}
                  disabled={loading || !reportConfig.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Saved Reports */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Reports</h3>
              
              {savedReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No saved reports yet</p>
                  <p className="text-sm">Save a configuration to reuse it later</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedReports.map(report => (
                    <div key={report._id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => loadSavedReport(report)}>
                      <div className="font-medium text-gray-900">{report.name}</div>
                      <div className="text-sm text-gray-600">
                        {report.config.metrics.length} metrics • {report.config.groupBy}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Templates */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setReportConfig({
                    ...reportConfig,
                    name: "Monthly Sales Summary",
                    metrics: ["revenue", "orders", "customers"],
                    groupBy: "month"
                  })}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Monthly Sales Summary</div>
                  <div className="text-sm text-gray-600">Revenue, orders, and customers by month</div>
                </button>
                
                <button
                  onClick={() => setReportConfig({
                    ...reportConfig,
                    name: "Product Performance Report",
                    metrics: ["products", "revenue", "conversionRate"],
                    groupBy: "day"
                  })}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Product Performance</div>
                  <div className="text-sm text-gray-600">Daily product sales and conversion rates</div>
                </button>
                
                <button
                  onClick={() => setReportConfig({
                    ...reportConfig,
                    name: "Customer Analysis Report",
                    metrics: ["customers", "averageOrderValue"],
                    groupBy: "week"
                  })}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Customer Analysis</div>
                  <div className="text-sm text-gray-600">Weekly customer metrics and order values</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default CustomReports;