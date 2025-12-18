import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Correct imports for layouts
import { Layout as LandownerLayout } from "./LandownerDashboard";
import FarmerLayout from "../../components/FarmerLayout";
import { Layout as DefaultLayout } from "../admin/Layout";

interface UserProfile {
  _id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  profileImage: string | null;
  joined?: string;
  updatedAt?: string;
}

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing. Please log in.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email,
          phone: res.data.phone || "",
        });
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load profile. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicFile(e.target.files[0]);
    } else {
      setProfilePicFile(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (profilePicFile) data.append("profileImage", profilePicFile);

      const res = await axios.put("http://localhost:5000/api/profile", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(res.data);
      setIsEditing(false);
      setProfilePicFile(null);
      setSuccessMsg("Profile updated successfully! ✅");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Choose Layout based on role
  const getLayout = () => {
    switch (profile?.role) {
      case "landowner":
        return LandownerLayout;
      case "farmer":
        return FarmerLayout;
      default:
        return DefaultLayout;
    }
  };
  const Layout = getLayout();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-500 rounded-full mb-6 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">No Profile Data</h3>
            <p className="text-gray-600">Unable to load profile information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              User Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your account settings and personal information
            </p>
          </div>

          {/* Main Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="p-8">
              {/* Success/Error Messages */}
              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  {profile.profileImage ? (
                    <img
                      src={`http://localhost:5000${profile.profileImage}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:border-emerald-400"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-emerald-200 shadow-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:border-emerald-400">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-6">
                {isEditing ? (
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    <ProfileEditField
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    <ProfileEditField
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={true}
                    />
                    <ProfileEditField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Profile Image
                      </label>
                      <input
                        type="file"
                        name="profileImage"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-colors duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <ProfileDetail
                        label="Role"
                        value={profile.role || "Not assigned"}
                      />
                      <ProfileDetail
                        label="Joined"
                        value={
                          profile.joined
                            ? new Date(profile.joined).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Not available"
                        }
                      />
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: profile.name || "",
                            email: profile.email,
                            phone: profile.phone || "",
                          });
                          setProfilePicFile(null);
                        }}
                        className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-6 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50"
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileDetail
                        label="Name"
                        value={profile.name || "Not set"}
                      />
                      <ProfileDetail label="Email" value={profile.email} />
                      <ProfileDetail
                        label="Phone"
                        value={profile.phone || "Not set"}
                      />
                      <ProfileDetail
                        label="Role"
                        value={profile.role || "Not assigned"}
                      />
                      <ProfileDetail
                        label="Joined"
                        value={
                          profile.joined
                            ? new Date(profile.joined).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Not available"
                        }
                      />
                    </div>
                    
                    <div className="pt-6">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 px-6 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ProfileDetail: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="bg-gray-50 rounded-lg p-4 border hover:border-gray-300 transition-all duration-300">
    <div className="flex justify-between items-center">
      <span className="text-gray-500 font-medium text-sm">{label}:</span>
      <span className="text-gray-900 font-semibold text-right">{value}</span>
    </div>
  </div>
);

const ProfileEditField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, name, value, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
      }`}
      placeholder={`Enter ${label.toLowerCase()}...`}
    />
  </div>
);

export default ProfileView;