import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { TrendingUp, Leaf, Search, Clock, CheckCircle, Zap, Users, Shield, ArrowRight, Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com";
        
        console.log("🔍 Fetching projects from:", `${backendUrl}/api/projects/investor`);
        console.log("🔑 Token exists:", !!token);
        console.log("👤 User role:", role);
        console.log("🌐 Backend URL from env:", (import.meta as any).env.VITE_BACKEND_URL);
        
        if (!token) {
          console.error("❌ No token found! User not logged in.");
          alert("Please login first");
          return;
        }
        
        if (role !== "investor") {
          console.error("❌ Wrong role! Current role:", role);
          alert(`Wrong user role: ${role}. Please login as investor.`);
          return;
        }
        
        const res = await axios.get(`${backendUrl}/api/projects/investor`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("✅ Projects response:", res.data);
        console.log("📊 Number of projects:", res.data.length);
        
        if (res.data && Array.isArray(res.data)) {
          setProjects(res.data);
          console.log("✅ Projects set successfully:", res.data.length);
        } else {
          console.error("❌ Invalid response format:", res.data);
        }
      } catch (err: any) {
        console.error("❌ Error fetching projects:", err);
        console.error("❌ Error message:", err.message);
        console.error("❌ Error response:", err.response?.data);
        console.error("❌ Error status:", err.response?.status);
        
        if (err.response?.status === 403) {
          console.error("🚫 Access denied - check if user is logged in as investor");
          alert("Access denied. Please login as investor.");
        } else if (err.code === "ERR_NETWORK") {
          console.error("🌐 Network error - backend might not be running");
          alert("Cannot connect to backend. Is the server running on port 5000?");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.cropType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalOpportunity = projects.reduce((sum, p) => sum + (p.fundingGoal - p.currentFunding), 0);
  const openProjects = projects.filter(p => p.status === "open").length;

  const getDaysRemaining = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return <InvestorLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div></InvestorLayout>;
  }

  return (
    <InvestorLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" /> Investment Projects
            </h1>
            <p className="text-gray-500 text-sm mt-1">Discover agricultural investment opportunities</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl">
              <p className="text-xs text-emerald-600">Open</p>
              <p className="text-lg font-bold text-emerald-700">{openProjects}</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl">
              <p className="text-xs text-blue-600">Available</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(totalOpportunity)}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" />
          </div>
          <div className="flex gap-2">
            {["all", "open", "funded"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize ${filterStatus === s ? "bg-emerald-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border"><Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No projects found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const progress = project.fundingGoal > 0 ? (project.currentFunding / project.fundingGoal) * 100 : 0;
              const daysLeft = getDaysRemaining(project.endDate);
              const isOpen = project.status === "open";

              return (
                <Link key={project._id} to={`/projects/${project._id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all">
                  {/* Header */}
                  <div className={`px-5 py-4 ${isOpen ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gray-400"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 bg-white/20 text-white">
                          {isOpen ? <Zap className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />} {project.status}
                        </span>
                        <h3 className="text-white font-semibold truncate">{project.title}</h3>
                      </div>
                      <span className="text-2xl ml-2">🌿</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                        <Leaf className="w-3 h-3" /> {project.cropType}
                      </span>
                      {isOpen && daysLeft > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                          <Clock className="w-3 h-3" /> {daysLeft}d left
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-gray-800">{formatCurrency(project.currentFunding)}</span>
                        <span className="text-gray-400">of {formatCurrency(project.fundingGoal)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <p className="text-right text-xs text-gray-400 mt-1">{progress.toFixed(0)}% funded</p>
                    </div>

                    <div className="flex items-center justify-between">
                      {project.farmerId && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {project.farmerId.name?.charAt(0) || "F"}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{project.farmerId.name || "Farmer"}</p>
                            <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> Verified</p>
                          </div>
                        </div>
                      )}
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${isOpen ? "bg-emerald-500 text-white group-hover:bg-emerald-600" : "bg-gray-100 text-gray-600"}`}>
                        {isOpen ? "Invest" : "View"} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Trust Bar */}
        <div className="mt-8 bg-white rounded-2xl border p-5">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-5 h-5 text-emerald-500" /> Secure Payments</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="w-5 h-5 text-blue-500" /> Verified Farmers</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><TrendingUp className="w-5 h-5 text-amber-500" /> 12-18% Returns</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Leaf className="w-5 h-5 text-purple-500" /> Sustainable</div>
          </div>
        </div>
      </div>
    </InvestorLayout>
  );
}
