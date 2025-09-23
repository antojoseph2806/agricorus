import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "./Layout";

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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600 font-medium">Loading {role}s...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-red-500 text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-lg font-semibold">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Manage {role.charAt(0).toUpperCase() + role.slice(1)}s
              <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {users.length} {users.length === 1 ? 'user' : 'users'}
              </span>
              </h2>
              </div>
        </div>

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No {role}s found.</p>
            <p className="text-gray-500">Try adjusting your search criteria or add new users.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                {/* User Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg truncate">{user.name || "Unnamed User"}</h3>
                      <p className="text-blue-100 text-sm">{user.email}</p>
                    </div>
                    <span className="bg-white text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* User Details */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Joined:</span>
                      <span className="text-gray-900">
                        {user.joined ? new Date(user.joined).toLocaleDateString() : "—"}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBlocked ? (
                          <>
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Blocked
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Active
                          </>
                        )}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-3">
                      <button
                        onClick={() => alert("Edit not implemented yet")}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border border-red-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => toggleBlock(user._id, user.isBlocked)}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 border ${
                          user.isBlocked
                            ? 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
                            : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200'
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {users.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Showing {users.length} of {users.length} users</span>
              <div className="flex space-x-4">
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Active: {users.filter(u => !u.isBlocked).length}
                </span>
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  Blocked: {users.filter(u => u.isBlocked).length}
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