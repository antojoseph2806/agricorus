// src/pages/admin/EditProject.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "./Layout";

interface ProjectForm {
  title: string;
  slug: string;
  fundingGoal: number;
  status: "open" | "funded" | "closed";
  isApproved: boolean;
}

const EditProjectadmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState<ProjectForm>({
    title: "",
    slug: "",
    fundingGoal: 0,
    status: "open",
    isApproved: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAxios = () =>
    axios.create({
      baseURL: `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}`,
      headers: { Authorization: `Bearer ${token}` },
    });

  // Fetch project by ID
  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data } = await getAxios().get(`/api/projects/${id}`);
      setFormData({
        title: data.title,
        slug: data.slug,
        fundingGoal: data.fundingGoal,
        status: data.status,
        isApproved: data.isApproved,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load project");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchProject();
  }, [id]);

  // --- START OF FIX ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    // Safely destructure name and value, which exist on both HTMLInputElement and HTMLSelectElement
    const { name, value } = target;
    
    // Check if the target is an HTMLInputElement AND has a 'type' property of 'checkbox'
    // This allows safe access to the 'checked' property.
    let newValue: string | boolean;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        newValue = target.checked;
    } else {
        newValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };
  // --- END OF FIX ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await getAxios().put(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/projects/${id}`, formData);
      setSuccess("Project updated successfully!");
      // Optional: navigate back to ManageProjects page after update
      setTimeout(() => navigate("/admin/manage-projects"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update project");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <p className="p-6 text-red-500">You must be logged in as admin to view this page.</p>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Project</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Funding Goal</label>
            <input
              type="number"
              name="fundingGoal"
              value={formData.fundingGoal}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="open">Open</option>
              <option value="funded">Funded</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isApproved"
              checked={formData.isApproved}
              onChange={handleChange}
            />
            <label>Approved</label>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Project
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default EditProjectadmin;