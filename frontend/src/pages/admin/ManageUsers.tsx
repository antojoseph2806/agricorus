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
  Eye
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
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
    fetchUsers();
  }, [role]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleBlock = async (id: string, isBlocked?: boolean) => {
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
    } catch (err) {
      console.error("Block/Unblock error:", err);
    }
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

  const activeUsers = users.filter(u => !u.isBlocked).length;
  const blockedUsers = users.filter(u => u.isBlocked).length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3b3b]"></div>
            </div>
            <p className="text-center text-gray-300 font-medium font-['Inter']">Loading {role}s...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-red-400 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-semibold font-['Poppins'] text-white">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-6">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl mb-6 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider font-['Poppins'] mb-2">
                Manage {role.charAt(0).toUpperCase() + role.slice(1)}s
              </h2>
              <div className="flex items-center gap-4 text-gray-300 font-['Inter']">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total: {users.length}
                </span>
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Active: {activeUsers}
                </span>
                <span className="flex items-center gap-2 text-red-400">
                  <Lock className="w-4 h-4" />
                  Blocked: {blockedUsers}
                </span>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter']"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-[#ff3b3b] focus:ring-2 focus:ring-[#ff3b3b]/20 transition-all duration-300 font-['Inter']"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300 text-lg font-['Inter'] mb-2">No {role}s found.</p>
            <p className="text-gray-400 font-['Inter']">Try adjusting your search criteria or add new users.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <div 
                key={user._id} 
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] group"
              >
                {/* User Header */}
                <div className="bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-t-2xl p-6 text-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg font-['Poppins'] truncate max-w-[120px]">
                          {user.name || "Unnamed User"}
                        </h3>
                        <p className="text-white/80 text-sm font-['Inter']">{user.role}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-white/10 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-['Inter'] text-sm truncate">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-['Inter'] text-sm">{user.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-['Inter'] text-sm">
                        {user.joined ? new Date(user.joined).toLocaleDateString() : "—"}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <span className="font-['Inter'] text-sm text-gray-400">Status:</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-['Inter'] ${
                        user.isBlocked 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {user.isBlocked ? (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Blocked
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </>
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button
                        onClick={() => toggleBlock(user._id, user.isBlocked)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 font-['Inter'] ${
                          user.isBlocked
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                        }`}
                      >
                        {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg font-medium text-sm transition-all duration-300 border border-red-500/30 font-['Inter']"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 font-['Inter']">
              <span>Showing {filteredUsers.length} of {users.length} users</span>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active: {activeUsers}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Blocked: {blockedUsers}
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