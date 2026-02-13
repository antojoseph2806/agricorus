import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Layout } from "./LandownerDashboard";
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
  Calendar,
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string;
  joined?: string;
  createdAt?: string;
}

const ProfileView: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const BASE_URL = "https://agricorus.duckdns.org";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const { data } = await axios.get<UserProfile>(`${BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setFormData({ name: data.name || "", phone: data.phone || "" });
        if (data.profileImage) setPreview(`${BASE_URL}${data.profileImage}`);
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
      setProfileImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;
    const isModified = formData.name !== user.name || formData.phone !== (user.phone || "") || profileImage !== null;
    if (!isModified) { alert("No changes to save."); setIsEditing(false); return; }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("phone", formData.phone);
    if (profileImage) submitData.append("profileImage", profileImage);

    try {
      setLoading(true);
      const { data } = await axios.put<UserProfile>(`${BASE_URL}/api/profile`, submitData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setUser(data);
      setFormData({ name: data.name || "", phone: data.phone || "" });
      setProfileImage(null);
      if (data.profileImage) setPreview(`${BASE_URL}${data.profileImage}`);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone || "" });
      setPreview(user.profileImage ? `${BASE_URL}${user.profileImage}` : null);
      setProfileImage(null);
    }
    setIsEditing(false);
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  if (loading && !user) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div></Layout>;
  if (!user) return <Layout><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center p-8 bg-red-50 rounded-2xl"><Shield className="w-16 h-16 text-red-400 mx-auto mb-4" /><p className="text-red-600 font-semibold">No profile found</p></div></div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {saveSuccess && <div className="fixed top-4 right-4 z-50 animate-slide-in"><div className="flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg"><CheckCircle className="w-5 h-5" /><span className="font-medium">Profile updated!</span></div></div>}
        
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
            <Sparkles className="absolute top-6 right-8 w-8 h-8 text-white/40" />
          </div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
                <img src={preview || `https://via.placeholder.com/150/10B981/FFFFFF?text=${user.name?.charAt(0) || "L"}`} alt="Profile" className="w-full h-full object-cover rounded-full bg-white" />
              </div>
              {isEditing && <label className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-600"><Camera className="w-5 h-5 text-white" /><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></label>}
              {!isEditing && <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white"><CheckCircle className="w-4 h-4 text-white" /></div>}
            </div>
          </div>
        </div>

        <div className="text-center mt-20 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{user.name || "Landowner"}</h1>
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-100">
            <Shield className="w-4 h-4 text-emerald-600" /><span className="text-emerald-700 font-medium capitalize">{user.role || "Landowner"}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
            <div><h2 className="text-xl font-bold text-gray-800">Profile Information</h2><p className="text-gray-500 text-sm mt-1">Manage your personal details</p></div>
            {!isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 shadow-lg"><Edit3 className="w-4 h-4" />Edit Profile</button>}
          </div>

          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><User className="w-4 h-4 text-emerald-500" />Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white" required /></div>
                <div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Mail className="w-4 h-4 text-emerald-500" />Email</label><div className="relative"><input type="email" value={user.email} disabled className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-100 rounded-xl text-gray-500 cursor-not-allowed" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md">Locked</span></div></div>
                <div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Phone className="w-4 h-4 text-emerald-500" />Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white" /></div>
                <div><label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Shield className="w-4 h-4 text-emerald-500" />Role</label><div className="relative"><input type="text" value={user.role || "Landowner"} disabled className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-100 rounded-xl text-gray-500 cursor-not-allowed capitalize" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-md">Locked</span></div></div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold disabled:opacity-50">{loading ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}</button>
                  <button type="button" onClick={handleCancelEdit} className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"><X className="w-5 h-5" />Cancel</button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6">
                {[
                  { icon: User, color: "emerald", label: "Full Name", value: user.name || "—" },
                  { icon: Mail, color: "blue", label: "Email Address", value: user.email, badge: "Verified" },
                  { icon: Phone, color: "amber", label: "Phone Number", value: user.phone || "Not provided" },
                  { icon: Shield, color: "purple", label: "Account Role", value: user.role || "Landowner", badge: "Active" },
                  { icon: Calendar, color: "cyan", label: "Member Since", value: formatDate(user.joined || user.createdAt) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-400 to-${item.color}-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}><item.icon className="w-6 h-6 text-white" /></div>
                    <div className="flex-1"><p className="text-sm text-gray-500 font-medium">{item.label}</p><p className="text-lg font-semibold text-gray-800 capitalize">{item.value}</p></div>
                    {item.badge && <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${item.badge === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{item.badge}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { icon: CheckCircle, color: "emerald", title: "Active", subtitle: "Account Status", badge: "Verified" },
            { icon: Shield, color: "blue", title: "Protected", subtitle: "Security Level", badge: "Secure" },
            { icon: Sparkles, color: "purple", title: "Landowner", subtitle: "Member Type", badge: "Premium" },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center`}><card.icon className={`w-6 h-6 text-${card.color}-600`} /></div>
                <span className={`text-xs bg-${card.color}-50 text-${card.color}-600 px-2 py-1 rounded-full font-medium`}>{card.badge}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.title}</p>
              <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } .animate-slide-in { animation: slide-in 0.3s ease-out; }`}</style>
    </Layout>
  );
};

export default ProfileView;
