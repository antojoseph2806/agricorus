import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Layout } from "./Layout";
import { 
  TrendingUp, DollarSign, Users, Eye, Search, RefreshCw, 
  Calendar, Award, BarChart3, AlertCircle, ExternalLink 
} from "lucide-react";

interface Investment {
  _id: string;
  amount: number;
  investorId: { _id: string; name: string; email: string };
  projectId: { _id: string; title: string; fundingGoal?: number; currentFunding?: number; status?: string };
  paymentId?: string;
  createdAt?: string;
}

interface InvestmentStats {
  totals: {
    totalAmount: number;
    totalCount: number;
  };
  topProjects: {
    projectId: string;
    title: string;
    totalAmount: number;
    count: number;
  }[];
}

const ManageInvestments: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<InvestmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/admin/investments`;

  const getToken = () => localStorage.getItem("token");

  const fetchAdminData = useCallback(async () => {
    setError(null);
    const token = getToken();
    if (!token) {
      setLoading(false);
      return setError("No token found. Please login as admin.");
    }

    try {
      setLoading(true);
      const [investmentsRes, statsRes] = await Promise.all([
        axios.get(API_BASE, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/stats/summary`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setInvestments(investmentsRes.data.investments || []);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error("Error fetching admin data:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredInvestments = investments.filter(inv => {
    const searchLower = searchTerm.toLowerCase();
    return (
      inv.investorId?.name?.toLowerCase().includes(searchLower) ||
      inv.investorId?.email?.toLowerCase().includes(searchLower) ||
      inv.projectId?.title?.toLowerCase().includes(searchLower) ||
      inv.paymentId?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading investment data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !investments.length) {
    return (
      <Layout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={fetchAdminData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Investment Dashboard</h1>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Monitor and track all platform investments</p>
              </div>
            </div>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm sm:text-base"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Total Count</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totals.totalCount}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Investments</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Total Raised</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">{formatCurrency(stats.totals.totalAmount)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Funds Raised</div>
            </div>
          </div>
        )}

        {/* Top Projects */}
        {stats && stats.topProjects.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              Top 10 Projects by Funding
            </h3>
            
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
              {stats.topProjects.map((project, index) => (
                <div key={project.projectId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-xs text-gray-600">{project.count} investments</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-2 truncate">{project.title}</p>
                  <p className="font-semibold text-green-600 text-base">{formatCurrency(project.totalAmount)}</p>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project Title</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Investments</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProjects.map((project, index) => (
                    <tr key={project.projectId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-50 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{project.title}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">{formatCurrency(project.totalAmount)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{project.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by investor, project, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              All Investments ({filteredInvestments.length})
            </h2>
          </div>
          
          {filteredInvestments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Investments Found</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {searchTerm ? "No investments match your search criteria" : "No investments have been made yet"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {filteredInvestments.map((inv) => (
                  <div key={inv._id} className="p-4 hover:bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{inv.investorId?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-600 truncate">{inv.investorId?.email || "N/A"}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 text-sm truncate">{inv.projectId?.title || "Project Deleted"}</p>
                        {inv.projectId?.status && (
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            inv.projectId.status === 'funded' ? 'bg-green-100 text-green-800' :
                            inv.projectId.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inv.projectId.status}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-green-600 text-base">
                          {formatCurrency(inv.amount)}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(inv.createdAt)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedInvestment(inv);
                          setShowDetailsModal(true);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Investor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvestments.map((inv) => (
                      <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{inv.investorId?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-600">{inv.investorId?.email || "N/A"}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{inv.projectId?.title || "Project Deleted"}</div>
                          {inv.projectId?.status && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                              inv.projectId.status === 'funded' ? 'bg-green-100 text-green-800' :
                              inv.projectId.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {inv.projectId.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-green-600">
                          {formatCurrency(inv.amount)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(inv.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedInvestment(inv);
                              setShowDetailsModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Investment Details Modal */}
        {showDetailsModal && selectedInvestment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">Investment Details</h2>
                    <p className="text-blue-100 text-xs sm:text-sm truncate">Complete transaction information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedInvestment(null);
                  }}
                  className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div className="space-y-4 sm:space-y-6 text-sm sm:text-base">
                  {/* Investment Amount */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label className="text-sm text-green-700 font-medium">Investment Amount</label>
                    <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(selectedInvestment.amount)}</p>
                  </div>

                  {/* Investor Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Investor Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Name</label>
                        <p className="font-semibold text-gray-900">{selectedInvestment.investorId?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-semibold text-gray-900">{selectedInvestment.investorId?.email || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Investor ID</label>
                        <p className="font-mono text-sm text-gray-700">{selectedInvestment.investorId?._id || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Project Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      Project Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Project Title</label>
                        <p className="font-semibold text-gray-900">{selectedInvestment.projectId?.title || "Project Deleted"}</p>
                      </div>
                      {selectedInvestment.projectId?.fundingGoal && (
                        <div>
                          <label className="text-sm text-gray-600">Funding Goal</label>
                          <p className="font-semibold text-gray-900">{formatCurrency(selectedInvestment.projectId.fundingGoal)}</p>
                        </div>
                      )}
                      {selectedInvestment.projectId?.currentFunding !== undefined && (
                        <div>
                          <label className="text-sm text-gray-600">Current Funding</label>
                          <p className="font-semibold text-gray-900">{formatCurrency(selectedInvestment.projectId.currentFunding)}</p>
                        </div>
                      )}
                      {selectedInvestment.projectId?.status && (
                        <div>
                          <label className="text-sm text-gray-600">Status</label>
                          <p className="font-semibold text-gray-900 capitalize">{selectedInvestment.projectId.status}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-gray-600">Project ID</label>
                        <p className="font-mono text-sm text-gray-700">{selectedInvestment.projectId?._id || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Transaction Details
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Payment ID</label>
                        <p className="font-mono text-sm text-gray-900">{selectedInvestment.paymentId || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Investment ID</label>
                        <p className="font-mono text-sm text-gray-900">{selectedInvestment._id}</p>
                      </div>
                      {selectedInvestment.createdAt && (
                        <div>
                          <label className="text-sm text-gray-600">Transaction Date</label>
                          <p className="font-semibold text-gray-900">{formatDate(selectedInvestment.createdAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageInvestments;
