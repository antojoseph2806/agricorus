import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sprout,
  DollarSign,
  Calendar,
  FileText,
  Rocket,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mr-4">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Launch New Project</h1>
              <p className="text-gray-600 mt-1">Deploy your agricultural initiative and connect with global supporters</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Organic Tomato Greenhouse"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Give your project a powerful name</p>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Sprout className="inline h-4 w-4 mr-1" />
                  Crop Type
                </label>
                <input
                  type="text"
                  name="cropType"
                  placeholder="e.g., Tomatoes, Wheat, Corn"
                  value={form.cropType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Specify your crop type</p>
              </div>

              {/* Funding Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Funding Goal (₹) *
                </label>
                <input
                  type="number"
                  name="fundingGoal"
                  placeholder="e.g., 50000"
                  value={form.fundingGoal}
                  onChange={handleChange}
                  required
                  min={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Set your funding target</p>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Campaign End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Campaign deployment deadline</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                name="description"
                placeholder="Describe your project vision, technology, and impact..."
                value={form.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Detail your project specifications and vision</p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Launch Project
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/farmer/projects")}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Rocket className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-emerald-900 mb-1">Project Guidelines</h3>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Projects require admin approval before going live</li>
                <li>• Provide detailed and accurate information</li>
                <li>• Set realistic funding goals and timelines</li>
                <li>• Keep your project description clear and compelling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
