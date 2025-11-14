import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { InvestorLayout } from "./InvestorLayout";

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

  const token = localStorage.getItem("token");
  const DEFAULT_IMAGE_URL = "https://via.placeholder.com/150/EEEEEE?text=Profile";

  // ============ Fetch profile ============
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const { data } = await axios.get<UserProfile>("https://agricorus.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          role: data.role || "",
        });
        if (data.profileImage) {
          setPreview(data.profileImage);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // ============ Handlers ============
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

    // Check if any changes were made
    const isModified =
      formData.name !== user.name ||
      formData.phone !== (user.phone || "") ||
      formData.role !== (user.role || "") ||
      profileImage !== null;

    if (!isModified) {
      alert("No changes to save.");
      setIsEditing(false);
      return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("phone", formData.phone);
    submitData.append("role", formData.role);
    if (profileImage) submitData.append("profileImage", profileImage);

    try {
      setLoading(true);
      const { data } = await axios.put<UserProfile>("https://agricorus.onrender.com/api/profile", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(data);
      setProfileImage(null);
      // Use the new profile image from response or keep current preview
      if (data.profileImage) {
        setPreview(data.profileImage);
      }
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Update failed.");
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
      setPreview(user.profileImage || null);
      setProfileImage(null);
    }
    setIsEditing(false);
  };

  // ============ Render ============
  if (loading && !user) return <p className="text-center mt-10">Loading...</p>;
  if (!user)
    return (
      <p className="text-center mt-10 text-red-600">
        No profile found. Please log in.
      </p>
    );

  return (
    <InvestorLayout>
    <div className="max-w-md mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Investor Profile 👤
      </h2>

      <div className="flex flex-col items-center mb-6">
        <img
          src={preview || user.profileImage || DEFAULT_IMAGE_URL}
          alt="Profile"
          className="w-32 h-32 object-cover rounded-full border-4 border-blue-200 mb-4 shadow-md"
        />

        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm border p-1 rounded-lg w-full"
            />
          </div>
        )}
      </div>

      {/* Use form only when editing to prevent accidental submissions */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="p-3 bg-gray-100 rounded-lg text-gray-500 italic">
              {user.email} (non-editable)
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="submit"
              className={`px-6 py-2 rounded-full text-white font-semibold ${
                loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 rounded-full bg-gray-400 text-white font-semibold hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Display mode - no form tag to prevent accidental submissions
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="p-3 bg-gray-50 rounded-lg">{user.name}</p>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="p-3 bg-gray-100 rounded-lg text-gray-500 italic">
              {user.email} (non-editable)
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="p-3 bg-gray-50 rounded-lg">
              {user.phone || "— Not provided"}
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="p-3 bg-gray-50 rounded-lg">{user.role || "Investor"}</p>
          </div>

          {/* Edit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
    </InvestorLayout>
  );
};

export default InvestorProfile;