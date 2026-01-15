import { useEffect, useState } from "react";
import axios from "axios";
import VendorLayout from "../VendorLayout";
import {
  Download,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  Filter,
  Search
} from "lucide-react";

interface DownloadableReport {
  _id: string;
  name: string;
  type: 'monthly' | 'custom' | 'product' | 'sales';
  format: 'pdf' | 'excel' | 'csv';
  status: 'ready' | 'generating' | 'failed';
  fileSize?: number;
  downloadUrl?: string;
  generatedAt: string;
  expiresAt?: string;
  downloadCount: number;
  parameters?: {
    dateRange?: { start: string; end: string };
    metrics?: string[];
    filters?: any;
  };
}

const DownloadCenter = () => {
  const [reports, setReports] = useState<DownloadableReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DownloadableReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/download-history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setReports(response.data.data);
        setFilteredReports(response.data.data);
      } else {
        setError(response.data.message || "Failed to load download history");
      }
    } catch (err: any) {
      console.error("Download history fetch error:", err);
      setError(err.response?.data?.message || "Failed to load download history");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/download-file/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const report = reports.find(r => r._id === reportId);
      if (!report) return;

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = report.format === 'pdf' ? 'pdf' : report.format === 'excel' ? 'xlsx' : 'csv';
      link.setAttribute('download', `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Update download count
      setReports(reports.map(r => 
        r._id === reportId ? { ...r, downloadCount: r.downloadCount + 1 } : r
      ));
    } catch (err: any) {
      console.error("Download error:", err);
      setError("Failed to download report");
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/delete-report/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setReports(reports.filter(r => r._id !== reportId));
      setFilteredReports(filteredReports.filter(r => r._id !== reportId));
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Failed to delete report");
    }
  };

  const generateQuickReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/generate-quick-report`,
        { type, format: 'pdf' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        fetchReports(); // Refresh the list
      }
    } catch (err: any) {
      console.error("Quick report generation error:", err);
      setError("Failed to generate quick report");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || report.type === filterType;
      const matchesStatus = filterStatus === "all" || report.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort by generation date (newest first)
    filtered.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    setFilteredReports(filtered);
  }, [reports, searchTerm, filterType, filterStatus]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50';
      case 'generating': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'generating': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'Monthly Report';
      case 'custom': return 'Custom Report';
      case 'product': return 'Product Report';
      case 'sales': return 'Sales Report';
      default: return 'Report';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'text-red-600 bg-red-50';
      case 'excel': return 'text-green-600 bg-green-50';
      case 'csv': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Download Center</h1>
              <p className="text-gray-600">Access and manage your generated reports and downloads.</p>
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => generateQuickReport('daily')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              Daily Report
            </button>
            <button
              onClick={() => generateQuickReport('weekly')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              Weekly Report
            </button>
            <button
              onClick={() => generateQuickReport('monthly')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              Monthly Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="monthly">Monthly Reports</option>
              <option value="custom">Custom Reports</option>
              <option value="product">Product Reports</option>
              <option value="sales">Sales Reports</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="generating">Generating</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading download history...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reports.length === 0 ? "No Reports Generated" : "No Reports Match Filters"}
            </h3>
            <p className="text-gray-500">
              {reports.length === 0 
                ? "Generate your first report to see it here." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFormatColor(report.format)}`}>
                          {report.format.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {getTypeLabel(report.type)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(report.generatedAt)}
                        </span>
                        {report.fileSize && (
                          <span>{formatFileSize(report.fileSize)}</span>
                        )}
                        <span>{report.downloadCount} downloads</span>
                      </div>

                      {report.parameters?.dateRange && (
                        <div className="text-sm text-gray-500 mb-3">
                          Date Range: {new Date(report.parameters.dateRange.start).toLocaleDateString()} - {new Date(report.parameters.dateRange.end).toLocaleDateString()}
                        </div>
                      )}

                      {report.expiresAt && (
                        <div className="text-sm text-orange-600">
                          Expires: {formatDate(report.expiresAt)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'ready' && (
                        <button
                          onClick={() => downloadReport(report._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => deleteReport(report._id)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default DownloadCenter;