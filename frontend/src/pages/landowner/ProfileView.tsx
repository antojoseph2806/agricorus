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

        const res = await axios.get("https://agricorus.onrender.com/api/profile", {
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

      const res = await axios.put("https://agricorus.onrender.com/api/profile", data, {
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
        <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full mb-6 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl uppercase tracking-wider mb-2">No Profile Data</h3>
            <p className="text-gray-300">Unable to load profile information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white uppercase tracking-widest mb-4 font-['Poppins']">
              User Profile
            </h1>
            <p className="text-gray-300 text-lg font-['Inter']">
              Manage your account settings and personal information
            </p>
          </div>

          {/* Main Profile Card */}
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.02]">
            <div className="p-8">
              {/* Success/Error Messages */}
              {successMsg && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 font-medium">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 font-medium">
                  {error}
                </div>
              )}

              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  {profile.profileImage ? (
                    <img
                      src={`https://agricorus.onrender.com${profile.profileImage}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-2xl transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:border-[#ff3b3b]/50"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 shadow-2xl transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:border-[#ff3b3b]/50">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
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
                      <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
                        Profile Image
                      </label>
                      <input
                        type="file"
                        name="profileImage"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
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
                        className="flex-1 py-3 px-6 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 ease-in-out border border-white/20 hover:border-white/40"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-lg font-medium hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50"
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
                        className="w-full py-3 px-6 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-lg font-medium hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:scale-105 uppercase tracking-wider"
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
  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 ease-in-out hover:scale-105">
    <div className="flex justify-between items-center">
      <span className="text-gray-400 font-medium uppercase tracking-wider text-sm">{label}:</span>
      <span className="text-white font-semibold text-right">{value}</span>
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
    <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-all duration-300 ease-in-out ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-white/40"
      }`}
      placeholder={`Enter ${label.toLowerCase()}...`}
    />
  </div>
);

export default ProfileView;