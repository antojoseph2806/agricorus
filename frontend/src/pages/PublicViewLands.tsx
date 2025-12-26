import React, { useEffect, useState } from "react";
import { MapPin, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";



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

const PublicViewLands: React.FC = () => {
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
        const res = await fetch(
          "http://localhost:5000/api/farmer/lands/public/available"
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
  };

  const handleReset = () => {
    setFilters({ minPrice: "", maxPrice: "", soilType: "" });
    setFilteredLands(lands);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center md:text-left">
            Featured Lands for Lease
          </h1>

          {/* Filters */}
          <div className="bg-white p-6 rounded-3xl shadow-lg mb-8 border flex flex-col md:flex-row gap-4 items-center justify-between">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price (₹)"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="px-5 py-3 rounded-2xl border border-gray-300 focus:ring-emerald-500 focus:ring-2 w-full md:w-1/4"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price (₹)"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="px-5 py-3 rounded-2xl border border-gray-300 focus:ring-emerald-500 focus:ring-2 w-full md:w-1/4"
            />
            <input
              type="text"
              name="soilType"
              placeholder="Soil Type"
              value={filters.soilType}
              onChange={handleFilterChange}
              className="px-5 py-3 rounded-2xl border border-gray-300 focus:ring-emerald-500 focus:ring-2 w-full md:w-1/4"
            />
            <div className="flex gap-3 mt-3 md:mt-0">
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition"
              >
                Search
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {filteredLands.length === 0 ? (
            <p className="text-gray-600 text-center text-lg">
              No lands available right now.
            </p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLands.map((land) => (
                <div
                  key={land._id}
                  onClick={() => navigate(`/land-details/${land._id}`)}
                  className="cursor-pointer bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-200 transform hover:-translate-y-1"
                >
                  <div className="relative h-52">
                    {land.landPhotos?.length > 0 ? (
                      <>
                        <img
                          src={land.landPhotos[0]}
                          alt={land.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <MapPin className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                      {land.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {land.location?.address}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                        Soil: {land.soilType}
                      </span>
                      <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Duration: {land.leaseDurationMonths} mo
                      </span>
                    </div>
                    <p className="text-emerald-700 font-bold text-lg">
                      ₹{land.leasePricePerMonth.toLocaleString()}/month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicViewLands;
