// src/pages/FarmerViewLands.tsx
import React, { useEffect, useState } from "react";
import { MapPin, Search, X, Filter, Server, Cloud, Cpu, Shield } from "lucide-react";
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

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${backendUrl}/api/farmer/lands/available`,
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Loading available lands...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching agricultural properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="h-10 w-1 bg-emerald-500 mr-4 rounded-full"></div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Available Lands for Lease
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            Browse and filter through our network of premium agricultural lands available for leasing. 
            <span className="text-emerald-600 font-semibold"> Find the perfect match</span> for your farming needs.
          </p>
        </div>

        {/* Filter Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <div className="hidden lg:flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">{lands.length} lands available</span>
                </div>
              </div>
            </div>

            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, soil type..."
                className="w-full lg:w-80 pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-300"
              />
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min amount"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max amount"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <input
                    type="text"
                    name="soilType"
                    placeholder="e.g., Loamy, Clay, Sandy"
                    value={filters.soilType}
                    onChange={handleFilterChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredLands.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-6xl mb-6">🏞️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {lands.length === 0 ? "No Lands Available" : "No Matching Results"}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              {lands.length === 0 
                ? "New agricultural lands will be available soon. Check back later."
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
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Image */}
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    {land.landPhotos && land.landPhotos.length > 0 ? (
                      <>
                        <img
                          src={land.landPhotos[0]}
                          alt={land.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                        <MapPin className="w-10 h-10 mb-2" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                      <TechIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h2 className="font-bold text-gray-900 text-base mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors duration-300">
                      {land.title}
                    </h2>

                    <div className="flex items-start mb-3">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 mr-1.5 flex-shrink-0" />
                      <span className="text-xs text-gray-600 line-clamp-1">
                        {land.location?.address}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200">
                        <p className="text-[10px] text-blue-600 font-medium mb-0.5">Soil Type</p>
                        <p className="text-xs font-bold text-blue-900 truncate">
                          {land.soilType}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200">
                        <p className="text-[10px] text-purple-600 font-medium mb-0.5">Duration</p>
                        <p className="text-xs font-bold text-purple-900">
                          {land.leaseDurationMonths}mo
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-500 mb-0.5">Monthly Lease</p>
                        <p className="text-lg font-bold text-emerald-600">
                          ₹{(land.leasePricePerMonth / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                        View
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerViewLands;