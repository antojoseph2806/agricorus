import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string;
}

const InvestorProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", role: "" });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/150/EEEEEE?text=Profile";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const { data } = await axios.get<UserProfile>(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          role: data.role || "",
        });
        if (data.profileImage) {
          setPreview(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}${data.profileImage}`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    const isModified =
      formData.name !== user.name ||
      formData.phone !== (user.phone || "") ||
      profileImage !== null;

    if (!isModified) {
      alert("No changes to save.");
      setIsEditing(false);
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("phone", formData.phone);
    if (profileImage) submitData.append("profileImage", profileImage);

    try {
      setLoading(true);
      const { data } = await axios.put<UserProfile>(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/profile`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(data);
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        role: data.role || "",
      });
      setProfileImage(null);
      if (data.profileImage) {
        setPreview(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}${data.profileImage}`);
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMsg = err.response?.data?.message || "Update failed. Please try again.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || "",
        role: user.role || "",
      });
      setPreview(user.profileImage ? `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}${user.profileImage}` : null);
      setProfileImage(null);
    }
    setIsEditing(false);
  };

  if (loading && !user) {
    return (
      <InvestorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading your profile...</p>
          </div>
        </div>
      </InvestorLayout>
    );
  }

  if (!user) {
    return (
      <InvestorLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center p-6 sm:p-8 bg-red-50 rounded-2xl border border-red-100">
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-semibold text-base sm:text-lg">No profile found</p>
            <p className="text-red-400 mt-2 text-sm sm:text-base">Please log in to view your profile</p>
          </div>
        </div>
      </InvestorLayout>
    );
  }

  return (
    <InvestorLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in">
            <div className="flex items-center gap-2 sm:gap-3 bg-emerald-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium">Profile updated!</span>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="relative mb-6 sm:mb-8">
          {/* Background Gradient Banner */}
          <div className="h-28 sm:h-40 lg:h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            <Sparkles className="absolute top-3 sm:top-6 right-3 sm:right-8 w-5 sm:w-8 h-5 sm:h-8 text-white/40" />
            <Sparkles className="absolute bottom-4 sm:bottom-12 left-4 sm:left-12 w-4 sm:w-6 h-4 sm:h-6 text-white/30" />
          </div>

          {/* Profile Image */}
          <div className="absolute -bottom-10 sm:-bottom-16 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
                <img
                  src={preview || (user.profileImage ? `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}${user.profileImage}` : DEFAULT_IMAGE_URL)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 sm:bottom-2 right-0 sm:right-2 w-7 h-7 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-600 transition-all hover:scale-110">
                  <Camera className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
              {!isEditing && (
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-5 h-5 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-white">
                  <CheckCircle className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name & Role Badge */}
        <div className="text-center mt-12 sm:mt-20 mb-4 sm:mb-8 px-4">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 break-words">{user.name || "Investor"}</h1>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-100">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
            <span className="text-xs sm:text-base text-emerald-700 font-medium capitalize">{user.role || "Investor"}</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <h2 className="text-base sm:text-xl font-bold text-gray-800">Profile Information</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Manage your personal details</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg sm:rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-6 lg:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name Field */}
                <div className="group">
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium text-sm sm:text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-gray-100 border-2 border-gray-100 rounded-lg sm:rounded-xl text-gray-500 cursor-not-allowed text-sm sm:text-base pr-16"
                    />
                    <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md">
                      Locked
                    </span>
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-lg sm:rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Role Field (Read-only) */}
                <div>
                  <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                    Role
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.role || "Investor"}
                      disabled
                      className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-gray-100 border-2 border-gray-100 rounded-lg sm:rounded-xl text-gray-500 cursor-not-allowed capitalize text-sm sm:text-base pr-16"
                    />
                    <span className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md">
                      Locked
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-6 py-2.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg sm:rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-6 py-2.5 sm:py-4 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all text-sm sm:text-base"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 sm:gap-6">
                {/* Name Display */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Full Name</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{user.name || "—"}</p>
                  </div>
                </div>

                {/* Email Display */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Email Address</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium flex-shrink-0">
                    Verified
                  </span>
                </div>

                {/* Phone Display */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Phone Number</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Role Display */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Account Role</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-800 capitalize truncate">
                      {user.role || "Investor"}
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium flex-shrink-0">
                    Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-8 mb-4 sm:mb-0">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium">
                Verified
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">Active</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Account Status</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                Secure
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">Protected</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Security Level</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">
                Premium
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800">Investor</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Member Type</p>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </InvestorLayout>
  );
};

export default InvestorProfile;
