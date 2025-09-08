// src/pages/farmer/projects/AddProject.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    cropType: "",
    fundingGoal: "",
    endDate: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/projects", form); // replace with your API base URL if needed
      navigate("/farmer/projects");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Add New Project</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={form.title}
          onChange={handleChange}
          required
          className="input"
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={form.description}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="text"
          name="cropType"
          placeholder="Crop Type"
          value={form.cropType}
          onChange={handleChange}
          className="input"
        />
        <input
          type="number"
          name="fundingGoal"
          placeholder="Funding Goal"
          value={form.fundingGoal}
          onChange={handleChange}
          required
          className="input"
        />
        <input
          type="date"
          name="endDate"
          placeholder="dd-mm-yyyy"
          value={form.endDate}
          onChange={handleChange}
          required
          className="input"
        />
        <button type="submit" className="btn">
          Create Project
        </button>
      </form>
    </div>
  );
}