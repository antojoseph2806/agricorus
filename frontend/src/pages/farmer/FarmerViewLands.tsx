// src/pages/FarmerViewLands.tsx
import React, { useEffect, useState } from "react";
import { MapPin, Loader, Search, X } from "lucide-react";
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
        setFilteredLands(data); // initially show all lands
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
  };

  const handleReset = () => {
    setFilters({ minPrice: "", maxPrice: "", soilType: "" });
    setFilteredLands(lands);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading available lands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-2 bg-blue-600 mr-3 rounded-sm"></div>
            <h1 className="text-xl font-bold text-gray-800">Available Lands for Lease</h1>
          </div>
          <p className="text-gray-600 mt-1 text-sm">
            Browse and filter through available agricultural lands for leasing
          </p>
        </div>

        {/* Filter Search Bar */}
        <div className="bg-white rounded-sm shadow-sm p-5 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input
                type="number"
                name="minPrice"
                placeholder="Min amount"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max amount"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <input
                type="text"
                name="soilType"
                placeholder="e.g., Loamy, Clay"
                value={filters.soilType}
                onChange={handleFilterChange}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleSearch}
                  className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-medium"
                >
                  <Search className="h-4 w-4 mr-1.5" />
                  Search
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-sm hover:bg-gray-300 transition-colors font-medium"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredLands.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-8 text-center border border-gray-200">
            <div className="text-5xl text-gray-300 mb-4">🏞️</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {lands.length === 0 ? "No lands available" : "No matching lands found"}
            </h3>
            <p className="text-gray-500">
              {lands.length === 0 
                ? "There are currently no lands available for lease. Please check back later."
                : "Try adjusting your search filters to find more results."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLands.map((land) => (
              <div
                key={land._id}
                onClick={() => navigate(`/farmer/lands/${land._id}`)}
                className="cursor-pointer bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden group"
              >
                {/* Image */}
                <div className="h-48 bg-gray-100 relative">
                  {land.landPhotos && land.landPhotos.length > 0 ? (
                    <img
                      src={land.landPhotos[0]}
                      alt={land.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <MapPin className="w-10 h-10 mb-2" />
                      <span className="text-sm">No image available</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {land.title}
                  </h2>

                  <div className="flex items-start mb-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {land.location?.address}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 p-2 rounded-sm">
                      <p className="text-xs text-gray-500 mb-1">Soil Type</p>
                      <p className="text-sm font-medium text-gray-800">
                        {land.soilType}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-sm">
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="text-sm font-medium text-gray-800">
                        {land.leaseDurationMonths} months
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{land.leasePricePerMonth.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-sm">
                      View Details
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerViewLands;