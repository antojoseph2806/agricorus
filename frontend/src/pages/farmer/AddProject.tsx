import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSeedling,
  FaDollarSign,
  FaCalendarAlt,
  FaPenNib,
  FaRocket,
  FaArrowLeft,
} from "react-icons/fa";

export default function AddProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    cropType: "",
    fundingGoal: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to create a project.");
        setLoading(false);
        return;
      }

      const projectData = {
        ...form,
        fundingGoal: Number(form.fundingGoal),
      };

      await axios.post("http://localhost:5000/api/projects/projects", projectData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/farmer/projects");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Forbidden: Only farmers can create projects.");
      } else {
        setError(err.response?.data?.error || "Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] p-4 relative overflow-hidden"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                <FaRocket className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
                Launch New Project
              </h1>
            </div>

            <p className="text-gray-200 text-lg font-light max-w-md mx-auto leading-relaxed">
              Deploy your agricultural initiative and connect with global supporters
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-white px-6 py-4 rounded-xl mb-8 shadow-lg">
              <span className="mr-3 text-xl">⚠️</span>
              <div>
                <p className="font-semibold text-sm">System Alert</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="relative group">
                <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden focus-within:border-[#ff3b3b] focus-within:ring-2 focus-within:ring-[#ff3b3b]/30 transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="pl-4 text-gray-300 group-focus-within:text-[#ff3b3b] transition-colors duration-300">
                    <FaPenNib />
                  </div>
                  <input
                    type="text"
                    name="title"
                    placeholder="Project Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-4 outline-none bg-transparent text-white placeholder-gray-400 font-medium"
                  />
                </div>
                <label className="block text-xs text-gray-300 mt-2 ml-1 font-light">
                  Give your project a powerful name
                </label>
              </div>

              {/* Crop Type */}
              <div className="relative group">
                <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden focus-within:border-[#ff3b3b] focus-within:ring-2 focus-within:ring-[#ff3b3b]/30 transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="pl-4 text-gray-300 group-focus-within:text-[#ff3b3b] transition-colors duration-300">
                    <FaSeedling />
                  </div>
                  <input
                    type="text"
                    name="cropType"
                    placeholder="e.g., Tomatoes, Wheat, Corn"
                    value={form.cropType}
                    onChange={handleChange}
                    className="w-full px-4 py-4 outline-none bg-transparent text-white placeholder-gray-400 font-medium"
                  />
                </div>
                <label className="block text-xs text-gray-300 mt-2 ml-1 font-light">
                  Specify your crop type
                </label>
              </div>

              {/* Funding Goal */}
              <div className="relative group">
                <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden focus-within:border-[#ff3b3b] focus-within:ring-2 focus-within:ring-[#ff3b3b]/30 transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="pl-4 text-gray-300 group-focus-within:text-[#ff3b3b] transition-colors duration-300">
                    <FaDollarSign />
                  </div>
                  <input
                    type="number"
                    name="fundingGoal"
                    placeholder="e.g., 50000"
                    value={form.fundingGoal}
                    onChange={handleChange}
                    required
                    min={100}
                    className="w-full px-4 py-4 outline-none bg-transparent text-white placeholder-gray-400 font-medium"
                  />
                </div>
                <label className="block text-xs text-gray-300 mt-2 ml-1 font-light">
                  Set your funding target (USD)
                </label>
              </div>

              {/* End Date */}
              <div className="relative group">
                <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden focus-within:border-[#ff3b3b] focus-within:ring-2 focus-within:ring-[#ff3b3b]/30 transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="pl-4 text-gray-300 group-focus-within:text-[#ff3b3b] transition-colors duration-300">
                    <FaCalendarAlt />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-4 outline-none bg-transparent text-white font-medium [color-scheme:dark]"
                  />
                </div>
                <label className="block text-xs text-gray-300 mt-2 ml-1 font-light">
                  Campaign deployment deadline
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="relative group">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden focus-within:border-[#ff3b3b] focus-within:ring-2 focus-within:ring-[#ff3b3b]/30 transition-all duration-300 group-hover:scale-[1.02]">
                <textarea
                  name="description"
                  placeholder="Describe your project vision, technology, and impact..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-4 outline-none bg-transparent text-white placeholder-gray-400 resize-none font-medium"
                />
              </div>
              <label className="block text-xs text-gray-300 mt-2 ml-1 font-light">
                Detail your project specifications and vision
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-gray-600 shadow-inner"
                  : "bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white hover:shadow-2xl hover:shadow-[#ff3b3b]/30 border border-[#ff3b3b]/20"
              } shadow-lg`}
            >
              <div className="flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deploying Project...</span>
                  </>
                ) : (
                  <>
                    <FaRocket className="text-sm" />
                    <span>Launch Project</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/farmer/projects")}
              className="inline-flex items-center text-white/80 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Return to Project Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Add custom styles for date input in dark mode */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.7;
          cursor: pointer;
        }
        input[type="date"]::-webkit-datetime-edit-text,
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field {
          color: white;
        }
        input[type="date"]:invalid::-webkit-datetime-edit-text,
        input[type="date"]:invalid::-webkit-datetime-edit-month-field,
        input[type="date"]:invalid::-webkit-datetime-edit-day-field,
        input[type="date"]:invalid::-webkit-datetime-edit-year-field {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
}
