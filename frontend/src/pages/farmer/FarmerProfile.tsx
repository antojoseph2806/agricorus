import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
// NOTE: Ensure 'react-toastify' is installed and configured in your root App component
import { toast } from "react-toastify"; 
import { Camera, Save } from "lucide-react";

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
  createdAt: string; // Used for "Joined" date
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
  const [editing, setEditing] = useState(false); // Fixes the "never read" warning as it's used now

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

  // Cleanup for image preview URL (Crucial for memory management)
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
    // Revert form data and state back to the original profile data
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
      
      // Append only the fields that are allowed to be edited
      if (formData.name && formData.name !== profile.name) data.append("name", formData.name);
      if (formData.email && formData.email !== profile.email) data.append("email", formData.email);
      if (imageFile) data.append("profileImage", imageFile);

      if (!data.get("name") && !data.get("email") && !data.get("profileImage")) {
        toast.info("No editable changes detected.");
        setEditing(false);
        setLoading(false);
        return;
      }

      const res = await axios.put<FarmerProfile>(`${BASE_URL}/api/profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Reset state upon successful save
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
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
    
  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white border rounded-xl shadow-sm p-8 text-center max-w-md">
        <div className="text-4xl mb-3">🙁</div>
        <p className="text-gray-900 font-semibold mb-1">Profile data not available.</p>
        <p className="text-gray-600 text-sm">Please re-login or try again.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-lg font-semibold">
              👩‍🌾
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Farmer Profile</h1>
              <p className="text-gray-600 text-sm">Manage your details used across the marketplace.</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Profile Image Section - Editable */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <img
              src={
                preview
                  ? preview
                  : profile.profileImage
                  ? `${BASE_URL}${profile.profileImage}`
                  : "https://via.placeholder.com/120/10B981/FFFFFF?text=FP"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-emerald-200"
            />
            {editing && (
              <label 
                htmlFor="profile-image-upload"
                className="absolute bottom-1 right-1 bg-emerald-600 p-2 rounded-full cursor-pointer text-white transition hover:bg-emerald-700 shadow-lg"
              >
                <Camera className="w-4 h-4" />
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
        </div>

        {/* Editable Fields */}
        <ProfileInputField
            label="Name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            disabled={loading}
            isReadOnly={!editing} // Only editable when 'editing' is true
            type="text"
        />

        <ProfileInputField
            label="Email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            disabled={loading}
            isReadOnly={!editing} // Only editable when 'editing' is true
            type="email"
        />

        {/* Read-Only Fields */}
        <ProfileInputField
            label="Phone (Read-Only)"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange} 
            disabled={true} // Always disabled
            isReadOnly={true} // Always read-only
            type="text"
        />

        {/* Joined Date Field - Read-Only Display */}
        <div>
          <label className="block text-gray-600 mb-1 font-medium">Joined Date</label>
          <div className="w-full bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-3 py-2">
            {formatDate(profile.createdAt)}
          </div>
        </div>

        {/* Action Button Section */}
        <div className="text-center pt-4">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-1/3 bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;


// ======================================================
// Helper Component for Input Fields (for clean reusable UI)
// ======================================================
interface ProfileInputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    isReadOnly: boolean;
    type: string;
}

const ProfileInputField: React.FC<ProfileInputFieldProps> = ({ 
    label, name, value, onChange, disabled, isReadOnly, type
}) => {
    
    // Class names for styling based on read-only mode
    const inputClasses = `w-full border rounded-lg px-3 py-2 transition duration-150 ${
        !isReadOnly 
          ? "bg-white border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" 
          : "bg-gray-100 border-gray-200 text-gray-700 cursor-default"
    }`;

    return (
        <div>
            <label htmlFor={name} className="block text-gray-600 mb-1 font-medium">{label}</label>
            <input
                id={name}
                type={type}
                name={name}
                // If it's read-only OR currently loading, the input is disabled
                disabled={isReadOnly || disabled} 
                readOnly={isReadOnly} // Use readOnly for better UX on fields you don't want edited
                value={value}
                onChange={onChange}
                className={inputClasses}
            />
        </div>
    );
};