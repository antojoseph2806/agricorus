// src/pages/FarmerViewLands.tsx
import React, { useEffect, useState } from "react";
import { MapPin, Loader, Search, X, Filter, Server, Cloud, Cpu, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Land {
  _id: string;
  title: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  soilType: string;
  leasePricePerMonth: number;
  leaseDurationMonths: number;
  landPhotos: string[];
  landDocuments: string[];
  status: string;
  isApproved: boolean;
}

const FarmerViewLands: React.FC = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [filteredLands, setFilteredLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    soilType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/farmer/lands/available",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setLands(data);
        setFilteredLands(data);
      } catch (err) {
        console.error("Error fetching lands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const filtered = lands.filter((land) => {
      let matches = true;
      if (filters.minPrice && land.leasePricePerMonth < Number(filters.minPrice))
        matches = false;
      if (filters.maxPrice && land.leasePricePerMonth > Number(filters.maxPrice))
        matches = false;
      if (
        filters.soilType &&
        land.soilType.toLowerCase() !== filters.soilType.toLowerCase()
      )
        matches = false;
      return matches;
    });
    setFilteredLands(filtered);
    setShowFilters(false);
  };

  const handleReset = () => {
    setFilters({ minPrice: "", maxPrice: "", soilType: "" });
    setFilteredLands(lands);
    setShowFilters(false);
  };

  const techIcons = [Server, Cloud, Cpu, Shield];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-red-500/25"></div>
          <p className="text-gray-300 font-medium font-poppins text-lg">Loading available lands...</p>
          <p className="text-gray-500 text-sm mt-2 font-inter">Scanning our agricultural network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl p-6 lg:p-8 mb-8 border border-white/10 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <div className="h-10 w-1 bg-red-500 mr-4 rounded-full shadow-lg shadow-red-500/25"></div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white font-poppins uppercase tracking-wider">
                Available Lands for Lease
              </h1>
            </div>
            <p className="text-lg text-gray-300 font-inter max-w-3xl leading-relaxed">
              Browse and filter through our network of premium agricultural lands available for leasing. 
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent font-semibold"> Advanced matching technology</span> ensures optimal soil compatibility.
            </p>
          </div>
        </div>

        {/* Filter Search Bar */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 mb-8 border border-white/10 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 border border-red-400/50"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <div className="hidden lg:flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-inter">{lands.length} lands available</span>
                </div>
              </div>
            </div>

            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, soil type..."
                className="w-full lg:w-80 pl-12 pr-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/25 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-800/30 rounded-xl border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider font-poppins">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min amount"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-700/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/25 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider font-poppins">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max amount"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-700/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/25 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wider font-poppins">
                    Soil Type
                  </label>
                  <input
                    type="text"
                    name="soilType"
                    placeholder="e.g., Loamy, Clay, Sandy"
                    value={filters.soilType}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-gray-700/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/25 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 border border-red-400/50"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredLands.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-12 text-center border border-white/10 backdrop-blur-sm">
            <div className="text-6xl text-gray-500/30 mb-6">🏞️</div>
            <h3 className="text-2xl font-bold text-white font-poppins uppercase tracking-wide mb-4">
              {lands.length === 0 ? "Network Scan Complete" : "No Matching Results"}
            </h3>
            <p className="text-gray-400 font-inter text-lg max-w-md mx-auto leading-relaxed">
              {lands.length === 0 
                ? "Our agricultural network is currently optimizing. New lands will be available soon."
                : "Try adjusting your search parameters or broaden your filters to discover more options."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLands.map((land, index) => {
              const TechIcon = techIcons[index % techIcons.length];
              return (
                <div
                  key={land._id}
                  onClick={() => navigate(`/farmer/lands/${land._id}`)}
                  className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/30 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-sm"
                >
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    {land.landPhotos && land.landPhotos.length > 0 ? (
                      <>
                        <img
                          src={land.landPhotos[0]}
                          alt={land.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <MapPin className="w-12 h-12 mb-3 opacity-50" />
                        <span className="text-sm text-gray-400">No image available</span>
                      </div>
                    )}
                    
                    {/* Tech Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-xl shadow-lg">
                      <TechIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 relative z-10">
                    <h2 className="font-bold text-white font-poppins text-lg mb-3 line-clamp-2 group-hover:text-red-400 transition-colors duration-300">
                      {land.title}
                    </h2>

                    <div className="flex items-start mb-3">
                      <MapPin className="h-4 w-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-300 line-clamp-2 font-inter">
                        {land.location?.address}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-700/50 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-poppins">Soil Type</p>
                        <p className="text-sm font-semibold text-white font-inter">
                          {land.soilType}
                        </p>
                      </div>
                      <div className="bg-gray-700/50 p-3 rounded-xl border border-white/5">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 font-poppins">Duration</p>
                        <p className="text-sm font-semibold text-white font-inter">
                          {land.leaseDurationMonths} months
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-poppins">Monthly Lease</p>
                        <p className="text-xl font-bold text-red-400 font-poppins">
                          ₹{land.leasePricePerMonth.toLocaleString()}
                          <span className="text-sm font-normal text-gray-400">/month</span>
                        </p>
                      </div>
                      <div className="text-xs text-gray-300 bg-gray-700/50 px-3 py-2 rounded-lg border border-white/5 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                        View Details
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'TOTAL LANDS', value: lands.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'AVERAGE PRICE', value: '₹25K/mo', color: 'from-purple-500 to-pink-500' },
            { label: 'SUCCESS RATE', value: '98%', color: 'from-green-500 to-emerald-500' },
            { label: 'ACTIVE LEASES', value: '47', color: 'from-orange-500 to-red-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-4 text-center border border-white/10 backdrop-blur-sm">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-2 shadow-lg`}>
                <div className="w-6 h-6 bg-white/20 rounded-lg"></div>
              </div>
              <p className="text-2xl font-bold text-white font-poppins">{stat.value}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-poppins">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerViewLands;