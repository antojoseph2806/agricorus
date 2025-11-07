import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { TrendingUp } from "lucide-react";
import { InvestorLayout } from "./InvestorLayout";


interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  cropType: string;
  fundingGoal: number;
  currentFunding: number;
  startDate: string;
  endDate: string;
  farmerId?: { _id: string; name: string | null; email: string };
}

export default function InvestorProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects/investor", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  return (
    <InvestorLayout>
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-green-600" /> Browse Investment Projects
      </h1>

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress =
              project.fundingGoal > 0
                ? (project.currentFunding / project.fundingGoal) * 100
                : 0;

            return (
              <div
                key={project._id}
                className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col"
              >
                {/* Header */}
                <div className="mb-3">
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-sm rounded-full capitalize ${
                      project.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-gray-600 mb-3">
                    {project.description.length > 100
                      ? project.description.slice(0, 100) + "..."
                      : project.description}
                  </p>

                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Crop:</span> {project.cropType}
                  </p>

                  {/* Funding Progress */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {formatCurrency(project.currentFunding)} raised of{" "}
                    {formatCurrency(project.fundingGoal)}
                  </p>

                  {/* Dates */}
                  <p className="text-xs text-gray-500">
                    Start: {new Date(project.startDate).toLocaleDateString()} | End:{" "}
                    {new Date(project.endDate).toLocaleDateString()}
                  </p>

                  {/* Farmer Info */}
                  {project.farmerId && (
                    <p className="text-sm text-gray-500 mt-2">
                      By:{" "}
                      <span className="font-medium">
                        {project.farmerId.name || "Unknown Farmer"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4">
                  <Link to={`http://localhost:5000/projects/${project._id}`} className="w-full block">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </InvestorLayout>
  );
}
