import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify"; 
import { 
  FaUser, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaCamera, 
  FaEnvelope, 
  FaPhone, 
  FaCalendarAlt,
  FaUserCircle,
  FaShieldAlt
} from "react-icons/fa";

// ======================================================
// 1. Types
// ======================================================
interface FarmerProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
  createdAt: string;
}

// ======================================================
// 2. Component
// ======================================================
const FarmerProfile: React.FC = () => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [formData, setFormData] = useState<Partial<FarmerProfile>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const BASE_URL =
    (import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"; 

  // Helper function to format the joined date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Date N/A";
    }
  };

  // ======================================================
  // 3. Data Fetching
  // ======================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("Please log in to view your profile.");
          return;
        }

        const res = await axios.get<FarmerProfile>(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setProfile(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [BASE_URL]);

  // Cleanup for image preview URL
  useEffect(() => {
    const currentPreview = preview;
    return () => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [preview]);

  // ======================================================
  // 4. Handlers
  // ======================================================
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile) {
      setFormData(profile); 
    }
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  // ======================================================
  // 5. Submit Update
  // ======================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const data = new FormData();
      
      if (formData.name && formData.name !== profile.name) data.append("name", formData.name);
      if (formData.email && formData.email !== profile.email) data.append("email", formData.email);
      if (imageFile) data.append("profileImage", imageFile);

      if (!data.get("name") && !data.get("email") && !data.get("profileImage")) {
        toast.info("No changes detected.");
        setEditing(false);
        setLoading(false);
        return;
      }

      const res = await axios.put<FarmerProfile>(`${BASE_URL}/api/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data);
      setFormData(res.data);
      setImageFile(null);
      setPreview(null);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("❌ Update error:", err);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // 6. Render UI
  // ======================================================
  if (loading && !profile) 
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-gray-900 text-xl font-semibold">Loading Profile...</h3>
          <p className="text-gray-600 mt-2">Fetching your account details</p>
        </div>
      </div>
    );
    
  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm border p-8 max-w-md text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h3 className="text-gray-900 text-xl font-bold mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Please re-login or try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
              <p className="text-gray-600 text-lg">Manage your account details and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              {/* Profile Image */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-200 shadow-lg">
                  <img
                    src={
                      preview
                        ? preview
                        : profile.profileImage
                        ? `${BASE_URL}${profile.profileImage}`
                        : "https://via.placeholder.com/128/10B981/FFFFFF?text=" + (profile.name?.charAt(0) || "F")
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {editing && (
                  <label 
                    htmlFor="profile-image-upload"
                    className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700 p-3 rounded-full cursor-pointer text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FaCamera className="w-4 h-4" />
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
              <div className="flex items-center justify-center mb-4">
                <FaShieldAlt className="text-emerald-600 mr-2" />
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-3 py-1 rounded-full text-sm">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center text-gray-600 mb-2">
                  <FaCalendarAlt className="mr-2" />
                  <span className="text-sm">Member Since</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(profile.createdAt)}</p>
              </div>

              {/* Action Button */}
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Edit Profile
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaSave className="text-sm" />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaTimes className="text-sm" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <FaUserCircle className="text-emerald-600 text-2xl mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
              </div>

              <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <FaUser className="text-emerald-600 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    disabled={!editing || loading}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                      editing && !loading
                        ? "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 bg-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <FaEnvelope className="text-emerald-600 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled={!editing || loading}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                      editing && !loading
                        ? "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 bg-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Phone Field (Read-only) */}
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <FaPhone className="text-emerald-600 mr-2" />
                    Phone Number
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Read Only</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                    placeholder="Phone number not available"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Contact support to update your phone number
                  </p>
                </div>

                {/* Account Type (Read-only) */}
                <div>
                  <label className="flex items-center text-gray-700 font-semibold mb-2">
                    <FaShieldAlt className="text-emerald-600 mr-2" />
                    Account Type
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg">
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Account
                  </div>
                </div>
              </form>
            </div>

            {/* Additional Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <FaUserCircle className="text-white text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Profile Tips</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Keep your profile information up to date for better service</li>
                    <li>• A profile picture helps build trust with other users</li>
                    <li>• Your email is used for important account notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;