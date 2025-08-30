// src/pages/FarmerViewLands.tsx
import React, { useEffect, useState } from "react";
import { MapPin, Loader } from "lucide-react";
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
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Featured Land for Lease
        </h1>

        {/* Filter Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-6 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price (₹)"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-1/4"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price (₹)"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-1/4"
          />
          <input
            type="text"
            name="soilType"
            placeholder="Soil Type"
            value={filters.soilType}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-1/4"
          />
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {filteredLands.length === 0 ? (
          <p className="text-gray-600">No lands available right now.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLands.map((land) => (
              <div
                key={land._id}
                onClick={() => navigate(`/farmer/lands/${land._id}`)}
                className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden border"
              >
                {/* Image */}
                <div className="h-40 bg-gray-100">
                  {land.landPhotos && land.landPhotos.length > 0 ? (
                    <img
                      src={land.landPhotos[0]}
                      alt={land.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <MapPin className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h2 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {land.title}
                  </h2>

                  <p className="text-sm text-gray-600">
                    {land.location?.address}
                  </p>

                  <p className="text-sm text-gray-500">
                    Soil: {land.soilType}
                  </p>

                  <p className="text-emerald-700 font-bold mt-2">
                    ₹{land.leasePricePerMonth.toLocaleString()}/month
                  </p>

                  <p className="text-gray-500 text-sm">
                    Duration: {land.leaseDurationMonths} months
                  </p>
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
