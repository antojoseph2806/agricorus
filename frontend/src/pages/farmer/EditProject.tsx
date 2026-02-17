// src/pages/farmer/projects/EditProject.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    cropType: "",
    fundingGoal: "",
    endDate: "",
    status: "open",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/projects/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const project = res.data;

        setForm({
          title: project.title,
          description: project.description,
          cropType: project.cropType || "",
          fundingGoal: project.fundingGoal.toString(),
          endDate: project.endDate ? project.endDate.split("T")[0] : "",
          status: project.status || "open",
        });
      } catch (err) {
        setError("❌ Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/projects/${id}`,
        {
          title: form.title,
          description: form.description,
          cropType: form.cropType,
          fundingGoal: Number(form.fundingGoal),
          endDate: form.endDate,
          status: form.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/farmer/projects");
    } catch (err: any) {
      alert(err.response?.data?.error || "❌ Failed to update project.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg font-medium text-gray-700">Loading project...⏳</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">
          Edit Project
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100 transform transition-all hover:shadow-2xl"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Crop Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Crop Type
            </label>
            <input
              type="text"
              name="cropType"
              value={form.cropType}
              onChange={handleChange}
              placeholder="e.g. Tomatoes, Wheat"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Funding Goal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Funding Goal (INR)
            </label>
            <input
              type="number"
              name="fundingGoal"
              value={form.fundingGoal}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="open">Open</option>
              <option value="funded">Funded</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row-reverse justify-end gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all transform hover:scale-105"
            >
              Save Changes ✨
            </button>
            <button
              type="button"
              onClick={() => navigate("/farmer/projects")}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}