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
  joined?: string;      // ✅ matches backend
  updatedAt?: string;   // optional
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
        return DefaultLayout; // fallback layout
    }
  };
  const Layout = getLayout();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-lime-100">
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">
              Loading profile...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
            <p className="text-gray-700 text-lg font-medium">
              No profile data available.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 via-lime-100 to-emerald-200 animate-gradient-shift">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border-t-4 border-green-600">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
              User Profile
            </h2>
            <p className="text-md text-gray-500 mt-2">
              Your personal details at a glance
            </p>
          </div>

          {successMsg && (
            <p className="text-green-700 font-medium mb-4">{successMsg}</p>
          )}
          {error && <p className="text-red-700 font-medium mb-4">{error}</p>}

          <div className="flex flex-col items-center space-y-6">
            {profile.profileImage ? (
              <img
                src={`http://localhost:5000${profile.profileImage}`} // ✅ ensure correct URL
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover ring-4 ring-offset-4 ring-green-500 transform transition-transform duration-500 ease-in-out hover:rotate-3 hover:scale-105"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-5xl font-bold ring-4 ring-offset-4 ring-green-500 transform transition-transform duration-500 ease-in-out hover:rotate-3 hover:scale-105">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}

            <div className="w-full space-y-5 text-gray-700">
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
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
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-600">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      name="profileImage"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
                    />
                  </div>
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
                  <div className="flex justify-between mt-6">
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
                      className="w-1/2 mr-2 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-1/2 ml-2 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
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
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="py-2 px-6 bg-green-600 text-white rounded-full font-medium shadow-md hover:bg-green-700 transition"
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
    </Layout>
  );
};

const ProfileDetail: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-300">
    <span className="font-semibold text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

const ProfileEditField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, name, value, onChange, disabled = false }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
        disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"
      }`}
    />
  </div>
);

export default ProfileView;
