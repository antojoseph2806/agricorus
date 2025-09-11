import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSeedling, FaDollarSign, FaCalendarAlt, FaPenNib } from "react-icons/fa"; // 👈 Import icons

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] p-10 transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Plant a New Seed 🚀
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">
          Create a project to find the support your farm needs.
        </p>

        {error && (
          <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <span className="mr-2 text-xl">⚠️</span>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="relative">
              <input
                type="text"
                name="title"
                placeholder="Project Title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full peer px-5 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors duration-300 outline-none"
              />
              <label
                htmlFor="title"
                className="absolute left-4 -top-3.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-green-600 transition-all duration-300 ease-in-out cursor-text"
              >
                Project Title
              </label>
              <FaPenNib className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-green-500" />
            </div>

            {/* Crop Type */}
            <div className="relative">
              <input
                type="text"
                name="cropType"
                placeholder="e.g., Tomatoes, Wheat"
                value={form.cropType}
                onChange={handleChange}
                className="w-full peer px-5 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors duration-300 outline-none"
              />
              <label
                htmlFor="cropType"
                className="absolute left-4 -top-3.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-green-600 transition-all duration-300 ease-in-out cursor-text"
              >
                Crop Type
              </label>
              <FaSeedling className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-green-500" />
            </div>

            {/* Funding Goal */}
            <div className="relative">
              <input
                type="number"
                name="fundingGoal"
                placeholder="e.g., 50000"
                value={form.fundingGoal}
                onChange={handleChange}
                required
                min="100"
                className="w-full peer px-5 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors duration-300 outline-none"
              />
              <label
                htmlFor="fundingGoal"
                className="absolute left-4 -top-3.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-green-600 transition-all duration-300 ease-in-out cursor-text"
              >
                Funding Goal
              </label>
              <FaDollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-green-500" />
            </div>

            {/* End Date */}
            <div className="relative">
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full peer px-5 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors duration-300 outline-none"
              />
              <label
                htmlFor="endDate"
                className="absolute left-4 -top-3.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-green-600 transition-all duration-300 ease-in-out cursor-text"
              >
                End Date
              </label>
              <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 peer-focus:text-green-500" />
            </div>
          </div>

          {/* Description */}
          <div className="relative">
            <textarea
              name="description"
              placeholder=" "
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full peer px-5 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors duration-300 outline-none resize-none"
            />
            <label
              htmlFor="description"
              className="absolute left-4 -top-3.5 text-xs text-gray-500 bg-white px-1 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-green-600 transition-all duration-300 ease-in-out cursor-text"
            >
              Project Description
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-4 rounded-lg transition-transform duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-gray-200"
                : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200"
            }`}
          >
            {loading ? "Creating Project..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}