import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "./Layout";
import { 
  Users, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  Clock
} from "lucide-react";

interface User {
  _id: string;
  email: string;
  phone: string;
  role: "landowner" | "farmer" | "investor" | "admin";
  isBlocked?: boolean;
  name?: string | null;
  profileImage?: string | null;
  joined?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  msg: string;
  count?: number;
  users?: User[];
}

interface UpdateUserResponse {
  msg: string;
  user: User;
}

interface ManageUsersProps {
  role: "landowner" | "farmer" | "investor";
}

const API_BASE_URL = "http://localhost:5000";

const ManageUsers: React.FC<ManageUsersProps> = ({ role }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<ApiResponse>(
        `${API_BASE_URL}/admin/users/role/${role}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data.users ?? []);
      setError(null);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setShowModal(false);
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBlock = async (id: string, isBlocked?: boolean) => {
    const action = isBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const endpoint = isBlocked
        ? `${API_BASE_URL}/admin/users/${id}/unblock`
        : `${API_BASE_URL}/admin/users/${id}/block`;

      const res = await axios.put<UpdateUserResponse>(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? res.data.user : u))
      );
      setShowModal(false);
      alert(`User ${action}ed successfully!`);
    } catch (err) {
      console.error("Block/Unblock error:", err);
      alert(`Failed to ${action} user. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getStatusIcon = (isBlocked?: boolean) => {
    return isBlocked ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (isBlocked?: boolean) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    return isBlocked 
      ? `${baseClasses} bg-red-100 text-red-800`
      : `${baseClasses} bg-green-100 text-green-800`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && !user.isBlocked) ||
                         (statusFilter === "blocked" && user.isBlocked);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => !u.isBlocked).length,
    blocked: users.filter(u => u.isBlocked).length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage {role.charAt(0).toUpperCase() + role.slice(1)}s
            </h1>
            <p className="text-gray-600">View and manage {role} accounts</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total {role.charAt(0).toUpperCase() + role.slice(1)}s</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Users</p>
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
              </div>
              <UserX className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-lg shadow border p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium text-lg mb-2">Error Loading Users</p>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={fetchUsers}
              className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow border p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No {role}s found</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          /* Users Table */
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <Shield className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || "Unnamed User"}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.isBlocked)}
                          <span className={getStatusBadge(user.isBlocked)}>
                            {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(user.joined || user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openModal(user)}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-900"
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
          </div>
        )}

        {/* Modal for User Details */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      User Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm text-gray-900">{selectedUser.name || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <p className="text-sm text-gray-900 capitalize">{selectedUser.role}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">User ID</label>
                        <p className="text-sm text-gray-900 font-mono">{selectedUser._id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Joined Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.joined || selectedUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Account Status
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      {getStatusIcon(selectedUser.isBlocked)}
                      <span className={getStatusBadge(selectedUser.isBlocked)}>
                        {selectedUser.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </div>
                    {selectedUser.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => toggleBlock(selectedUser._id, selectedUser.isBlocked)}
                      disabled={actionLoading === selectedUser._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                        selectedUser.isBlocked
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      {selectedUser.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {actionLoading === selectedUser._id 
                        ? 'Processing...' 
                        : selectedUser.isBlocked ? 'Unblock User' : 'Block User'
                      }
                    </button>
                    
                    <button
                      onClick={() => handleDelete(selectedUser._id)}
                      disabled={actionLoading === selectedUser._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {actionLoading === selectedUser._id ? 'Deleting...' : 'Delete User'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        {filteredUsers.length > 0 && (
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
              <span>Showing {filteredUsers.length} of {users.length} users</span>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active: {stats.active}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Blocked: {stats.blocked}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageUsers;