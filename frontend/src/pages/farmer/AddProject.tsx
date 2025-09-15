import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSeedling, FaDollarSign, FaCalendarAlt, FaPenNib } from "react-icons/fa";

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

      await axios.post(
        "http://localhost:5000/api/projects/projects",
        projectData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-md shadow-md p-8">
        <div className="flex items-center mb-6">
          <div className="h-10 w-4 bg-yellow-400 mr-2 rounded-sm"></div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Project</h1>
        </div>
        
        <p className="text-gray-600 mb-8 text-sm">
          Launch your agricultural project and connect with supporters
        </p>

        {error && (
          <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <span className="mr-2 text-xl">⚠️</span>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all duration-200">
                <div className="pl-4 text-gray-400">
                  <FaPenNib />
                </div>
                <input
                  type="text"
                  name="title"
                  placeholder="Project Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 outline-none"
                />
              </div>
              <label className="block text-xs text-gray-500 mt-1 ml-1">
                Give your project a catchy name
              </label>
            </div>

            {/* Crop Type */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all duration-200">
                <div className="pl-4 text-gray-400">
                  <FaSeedling />
                </div>
                <input
                  type="text"
                  name="cropType"
                  placeholder="e.g., Tomatoes, Wheat"
                  value={form.cropType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 outline-none"
                />
              </div>
              <label className="block text-xs text-gray-500 mt-1 ml-1">
                What are you growing?
              </label>
            </div>

            {/* Funding Goal */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all duration-200">
                <div className="pl-4 text-gray-400">
                  <FaDollarSign />
                </div>
                <input
                  type="number"
                  name="fundingGoal"
                  placeholder="e.g., 50000"
                  value={form.fundingGoal}
                  onChange={handleChange}
                  required
                  min="100"
                  className="w-full px-4 py-3 outline-none"
                />
              </div>
              <label className="block text-xs text-gray-500 mt-1 ml-1">
                Funding goal in dollars
              </label>
            </div>

            {/* End Date */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all duration-200">
                <div className="pl-4 text-gray-400">
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
                  className="w-full px-4 py-3 outline-none"
                />
              </div>
              <label className="block text-xs text-gray-500 mt-1 ml-1">
                Campaign end date
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="relative">
            <div className="border border-gray-300 rounded-sm overflow-hidden focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500 transition-all duration-200">
              <textarea
                name="description"
                placeholder="Describe your project in detail..."
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 outline-none resize-none"
              />
            </div>
            <label className="block text-xs text-gray-500 mt-1 ml-1">
              Share your story and project details
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-sm transition-all duration-200 ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md"
            }`}
          >
            {loading ? "Creating Project..." : "Launch Project"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate("/farmer/projects")}
            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
          >
            ← Back to my projects
          </button>
        </div>
      </div>
    </div>
  );
}