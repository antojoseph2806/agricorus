import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, RefreshCcw, Star, TrendingUp, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "./Layout";

// Updated Interface: startDate and endDate are already removed
interface Lease {
  _id: string;
  status: "pending" | "active" | "completed" | "cancelled" | "accepted";
  land?: { 
    title: string; 
    location: { 
      address: string; 
      latitude: number; 
      longitude: number 
    } 
  };
  farmer?: { name: string; email: string };
  owner?: { name: string; email: string };
  createdAt: string;
}

const AdminLeasesPage: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const navigate = useNavigate(); // useNavigate is kept in case it's used elsewhere, but not used for lease editing

  const fetchLeases = async (status?: string) => {
    try {
      setLoading(true);
      const url = status
        ? `http://localhost:5000/api/admin/leases?status=${status}`
        : "http://localhost:5000/api/admin/leases";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeases(res.data);
    } catch (err) {
      console.error("Error fetching leases:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLease = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lease?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/leases/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchLeases(filter);
    } catch (err) {
      console.error("Error deleting lease:", err);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/leases/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchLeases(filter);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  // Stats for the header bar
  const stats = {
    total: leases.length,
    active: leases.filter(l => l.status === 'active').length,
    pending: leases.filter(l => l.status === 'pending').length,
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Helper function to safely render location
  const renderLocation = (location: any) => {
    if (!location) return "";
    
    if (typeof location === 'string') {
      return location;
    }
    
    if (typeof location === 'object' && location.address) {
      return location.address;
    }
    
    if (typeof location === 'object') {
      // Fallback: stringify the object for debugging
      return JSON.stringify(location);
    }
    
    return "N/A";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        {/* Stats Header Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-blue-50 p-3 rounded-lg mr-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Leases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-green-50 p-3 rounded-lg mr-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Leases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="bg-yellow-50 p-3 rounded-lg mr-4">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending Leases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Manage Leases</h2>
                  <p className="text-blue-100 mt-1">Monitor and manage all lease agreements</p>
                </div>
                <div className="flex gap-3 items-center">
                  {/* Filter by status */}
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      fetchLeases(e.target.value || undefined);
                    }}
                    className="border-0 rounded-lg px-4 py-2 text-sm bg-white/20 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/50"
                  >
                    <option value="" className="text-gray-900">All Leases</option>
                    <option value="active" className="text-gray-900">Active</option>
                    <option value="completed" className="text-gray-900">Completed</option>
                    <option value="cancelled" className="text-gray-900">Cancelled</option>
                    <option value="pending" className="text-gray-900">Pending</option>
                    <option value="accepted" className="text-gray-900">Accepted</option>
                  </select>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fetchLeases(filter)}
                    disabled={loading}
                    className="bg-white/20 hover:bg-white/30 border-0 text-white backdrop-blur-sm"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Land</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Farmer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leases.map((lease) => (
                    <tr 
                      key={lease._id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{lease.land?.title || "N/A"}</p>
                          <p className="text-sm text-gray-500">
                            {lease.land?.location ? renderLocation(lease.land.location) : "No location"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{lease.farmer?.name || "N/A"}</p>
                          <p className="text-sm text-gray-500">{lease.farmer?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{lease.owner?.name || "N/A"}</p>
                          <p className="text-sm text-gray-500">{lease.owner?.email || ""}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lease.status)}`}>
                          {lease.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center">
                          {/* // Edit button removed:
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/leases/${lease._id}/edit`)}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button> 
                          */}

                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteLease(lease._id)}
                            className="bg-red-500 hover:bg-red-600 border-0 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          {/* Status dropdown */}
                          <select
                            value={lease.status}
                            onChange={(e) => changeStatus(lease._id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          >
                            {/* NOTE: I am only including status options that can be manually changed by the admin, like 'completed' or 'cancelled' */}
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="active">Active</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leases.length === 0 && (
                    <tr>
                      <td
                        colSpan={5} // Correct colSpan for the remaining 5 columns
                        className="text-center py-8 text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Star className="w-12 h-12 text-gray-300 mb-2" />
                          <p className="text-lg font-medium">No leases found</p>
                          <p className="text-sm">Try changing your filters or check back later</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with summary */}
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Showing {leases.length} lease{leases.length !== 1 ? 's' : ''}</span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLeasesPage;