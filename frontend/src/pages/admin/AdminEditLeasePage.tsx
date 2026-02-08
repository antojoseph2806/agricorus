import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "./Layout";
import { ArrowLeft, Save, Calendar, BadgeCheck, Clock, MapPin, User, Mail } from "lucide-react";

interface Lease {
  _id: string;
  status: "pending" | "active" | "completed" | "cancelled" | "accepted";
  startDate?: string;
  endDate?: string;
  land?: { title: string; location: string };
  farmer?: { name: string; email: string };
  owner?: { name: string; email: string };
  createdAt: string;
}

const AdminEditLeasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLease = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`https://agricorus.onrender.com/api/admin/leases/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLease(res.data);
    } catch (err) {
      console.error("Error fetching lease:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateLease = async () => {
    if (!id || !lease) return;
    try {
      setSaving(true);
      await axios.put(`/api/admin/leases/${id}`, lease, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Lease updated successfully");
      navigate("/admin/leases");
    } catch (err) {
      console.error("Error updating lease:", err);
      alert("Error updating lease");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchLease();
  }, [id]);

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

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <BadgeCheck className="w-4 h-4" />,
      completed: <BadgeCheck className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      cancelled: <Clock className="w-4 h-4" />,
      accepted: <BadgeCheck className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lease details...</p>
        </div>
      </div>
    </Layout>
  );

  if (!lease) return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BadgeCheck className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lease Not Found</h2>
          <p className="text-gray-600 mb-4">The requested lease could not be found.</p>
          <Button onClick={() => navigate("/admin/leases")} className="bg-blue-600 hover:bg-blue-700">
            Back to Leases
          </Button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        {/* Header Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/leases")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leases
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BadgeCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Lease Agreement</h1>
              <p className="text-gray-600">Update lease details and status</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lease Information Card */}
          <Card className="lg:col-span-2 shadow-2xl border-0 rounded-2xl bg-white">
            <CardContent className="p-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Lease Details</h2>
                    <p className="text-blue-100">ID: {lease._id}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(lease.status)}`}>
                    {getStatusIcon(lease.status)}
                    {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" />
                    Lease Status
                  </label>
                  <select
                    value={lease.status}
                    onChange={(e) =>
                      setLease({ ...lease, status: e.target.value as Lease["status"] })
                    }
                    className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={lease.startDate ? lease.startDate.split("T")[0] : ""}
                      onChange={(e) =>
                        setLease({ ...lease, startDate: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={lease.endDate ? lease.endDate.split("T")[0] : ""}
                      onChange={(e) =>
                        setLease({ ...lease, endDate: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin/leases")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={updateLease}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Lease Summary */}
          <div className="space-y-6">
            {/* Land Information */}
            <Card className="shadow-2xl border-0 rounded-2xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Land Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium text-gray-900">{lease.land?.title || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{lease.land?.location || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Farmer Information */}
            <Card className="shadow-2xl border-0 rounded-2xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Farmer Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{lease.farmer?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lease.farmer?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Information */}
            <Card className="shadow-2xl border-0 rounded-2xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Owner Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{lease.owner?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lease.owner?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Created Date */}
            <Card className="shadow-2xl border-0 rounded-2xl bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="font-medium text-gray-900">
                      {new Date(lease.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEditLeasePage;