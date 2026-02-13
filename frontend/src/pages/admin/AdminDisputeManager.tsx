import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Layout } from "./Layout";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  DollarSign,
  Calendar,
  FileText,
  MessageSquare,
  RefreshCw,
  Filter,
  Shield,
} from "lucide-react";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/disputes/admin`;

interface UserRef {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Dispute {
  _id: string;
  raisedBy: UserRef;
  against: UserRef;
  lease?: { _id: string };
  reason: string;
  details: string;
  category: string;
  amountInvolved: number;
  preferredResolution: string;
  dateOfIncident: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminRemarks?: string;
}

const AdminDisputeManager: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<string>("");

  const token = localStorage.getItem("token");

  const fetchDisputes = async (status?: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const url = status ? `${API_BASE}/all?status=${status}` : `${API_BASE}/all`;
      const res = await axios.get(url, { headers });
      setDisputes(res.data.disputes || res.data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "resolved" | "rejected" | "in_review") => {
    if (!remarks.trim()) {
      toast.warning("⚠️ Please enter remarks before taking action.");
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${API_BASE}/${id}/status`,
        { status: action, resolutionNote: remarks },
        { headers }
      );
      toast.success(`✅ Dispute marked as ${action}`);
      setRemarks("");
      setSelectedDispute(null);
      fetchDisputes(statusFilter);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update dispute");
    }
  };

  useEffect(() => {
    fetchDisputes(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
                <p className="text-gray-600 text-lg mt-1">
                  Review and resolve disputes between landowners and farmers
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Disputes",
                value: disputes.length,
                icon: FileText,
                color: "from-blue-400 to-blue-600",
              },
              {
                label: "Open",
                value: disputes.filter((d) => d.status === "open").length,
                icon: AlertCircle,
                color: "from-yellow-400 to-yellow-600",
              },
              {
                label: "Resolved",
                value: disputes.filter((d) => d.status === "resolved").length,
                icon: CheckCircle,
                color: "from-green-400 to-green-600",
              },
              {
                label: "Rejected",
                value: disputes.filter((d) => d.status === "rejected").length,
                icon: XCircle,
                color: "from-red-400 to-red-600",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-500" />
                <label className="font-semibold text-gray-700">Filter by status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-gray-700"
                >
                  <option value="">All Disputes</option>
                  <option value="open">Open</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button
                onClick={() => fetchDisputes(statusFilter)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Dispute Cards */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : disputes.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Disputes Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are no disputes matching your filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {disputes.map((d) => (
                <div
                  key={d._id}
                  className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {d.category}
                        </h2>
                        <p className="text-gray-600 font-medium">{d.reason}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                          d.status === "open"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : d.status === "in_review"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : d.status === "resolved"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {d.status === "open" && <AlertCircle className="w-4 h-4" />}
                        {d.status === "in_review" && <Clock className="w-4 h-4" />}
                        {d.status === "resolved" && <CheckCircle className="w-4 h-4" />}
                        {d.status === "rejected" && <XCircle className="w-4 h-4" />}
                        {d.status.toUpperCase().replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    {/* Details Section */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                        Dispute Details
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{d.details}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <p className="text-xs text-blue-600 font-semibold uppercase">
                            Raised By
                          </p>
                        </div>
                        <p className="text-gray-900 font-bold">{d.raisedBy.name}</p>
                        <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {d.raisedBy.email}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Role: {d.raisedBy.role}
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <p className="text-xs text-purple-600 font-semibold uppercase">
                            Against
                          </p>
                        </div>
                        <p className="text-gray-900 font-bold">{d.against.name}</p>
                        <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {d.against.email}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Role: {d.against.role}
                        </p>
                      </div>

                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs text-emerald-600 font-semibold uppercase">
                            Amount Involved
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-900">
                          ₹{d.amountInvolved?.toLocaleString() || 0}
                        </p>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <p className="text-xs text-amber-600 font-semibold uppercase">
                            Filed On
                          </p>
                        </div>
                        <p className="text-gray-900 font-bold">
                          {new Date(d.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Preferred Resolution */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        Preferred Resolution
                      </p>
                      <p className="text-gray-700">{d.preferredResolution}</p>
                    </div>

                    {/* Admin Remarks (if any) */}
                    {d.adminRemarks && (
                      <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-600 uppercase">
                            Admin Remarks
                          </p>
                        </div>
                        <p className="text-gray-700">{d.adminRemarks}</p>
                      </div>
                    )}

                    {/* Action Section */}
                    {(d.status === "open" || d.status === "in_review") && (
                      <div className="border-t border-gray-200 pt-6">
                        {selectedDispute === d._id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Resolution Notes / Admin Response
                              </label>
                              <textarea
                                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[120px]"
                                placeholder="Enter your resolution notes, decision, and any actions taken..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-3 flex-wrap">
                              <button
                                onClick={() => handleAction(d._id, "resolved")}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25"
                              >
                                <CheckCircle className="w-5 h-5" />
                                Mark as Resolved
                              </button>
                              <button
                                onClick={() => handleAction(d._id, "rejected")}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25"
                              >
                                <XCircle className="w-5 h-5" />
                                Reject Dispute
                              </button>
                              <button
                                onClick={() => handleAction(d._id, "in_review")}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                              >
                                <Clock className="w-5 h-5" />
                                Mark In Review
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDispute(null);
                                  setRemarks("");
                                }}
                                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedDispute(d._id)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Respond to Dispute
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDisputeManager;
