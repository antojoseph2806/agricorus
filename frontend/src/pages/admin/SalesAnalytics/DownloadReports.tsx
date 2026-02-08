import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Layout } from '../Layout';

interface ReportRequest {
  id: string;
  type: string;
  period: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  downloadUrl?: string;
}

const DownloadReports: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('1month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportRequests, setReportRequests] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'overview', label: 'Sales Overview', description: 'Complete sales summary with key metrics' },
    { value: 'monthly', label: 'Monthly Report', description: 'Detailed monthly performance analysis' },
    { value: 'products', label: 'Product Performance', description: 'Individual product sales and performance' },
    { value: 'revenue', label: 'Revenue Analysis', description: 'Revenue trends and growth analysis' },
    { value: 'customers', label: 'Customer Analytics', description: 'Customer behavior and demographics' },
    { value: 'vendors', label: 'Vendor Performance', description: 'Vendor sales and commission reports' },
  ];

  const periodOptions = [
    { value: '1week', label: 'Last Week' },
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const generateReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const requestBody: any = {
        type: selectedReportType,
        period: selectedPeriod,
      };

      if (selectedPeriod === 'custom') {
        requestBody.startDate = customStartDate;
        requestBody.endDate = customEndDate;
      }

      const response = await fetch('https://agricorus.onrender.com/api/admin/sales-analytics/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setReportRequests(prev => [data.request, ...prev]);
        
        // If report is ready immediately, download it
        if (data.downloadUrl) {
          downloadFile(data.downloadUrl, data.filename);
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadExistingReport = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://agricorus.onrender.com/api/admin/sales-analytics/download-report/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `report-${requestId}.csv`;
        
        downloadFile(url, filename);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Download Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download detailed sales analytics reports</p>
        </div>

        {/* Report Generator */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={selectedReportType === type.value}
                      onChange={(e) => setSelectedReportType(e.target.value)}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Time Period</label>
              <div className="space-y-3">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {selectedPeriod === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={generateReport}
              disabled={loading || (selectedPeriod === 'custom' && (!customStartDate || !customEndDate))}
              className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Generate Report
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
          
          {reportRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
              <p className="text-gray-600">Generate your first report using the form above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reportTypes.find(t => t.value === request.type)?.label || request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {periodOptions.find(p => p.value === request.period)?.label || request.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'completed' && (
                          <button
                            onClick={() => downloadExistingReport(request.id)}
                            className="text-emerald-600 hover:text-emerald-900 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Download Options */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Downloads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-700">This Month's Report</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-700">Last Quarter Report</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition">
              <Download className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-700">Annual Report</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DownloadReports;