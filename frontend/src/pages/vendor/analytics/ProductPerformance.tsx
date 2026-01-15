import { useEffect, useState } from "react";
import axios from "axios";
import VendorLayout from "../VendorLayout";
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Star,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Activity
} from "lucide-react";

interface ProductMetrics {
  _id: string;
  name: string;
  images?: string[];
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  views: number;
  conversionRate: number;
  stockLevel: number;
  revenueGrowth: number;
  salesGrowth: number;
  category: string;
  price: number;
}

const ProductPerformance = () => {
  const [products, setProducts] = useState<ProductMetrics[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("revenue");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProductPerformance = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/analytics/product-performance`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const productData = response.data.data;
        setProducts(productData);
        setFilteredProducts(productData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productData.map((p: ProductMetrics) => p.category))];
        setCategories(uniqueCategories);
      } else {
        setError(response.data.message || "Failed to load product performance");
      }
    } catch (err: any) {
      console.error("Product performance fetch error:", err);
      setError(err.response?.data?.message || "Failed to load product performance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductPerformance();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          return b.totalRevenue - a.totalRevenue;
        case "sales":
          return b.totalSold - a.totalSold;
        case "rating":
          return b.averageRating - a.averageRating;
        case "views":
          return b.views - a.views;
        case "conversion":
          return b.conversionRate - a.conversionRate;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, filterCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600 bg-red-50";
    if (stock < 10) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? "text-yellow-500 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Performance</h1>
              <p className="text-gray-600">Analyze individual product metrics and performance trends.</p>
            </div>
            <button
              onClick={fetchProductPerformance}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="sales">Sort by Sales</option>
              <option value="rating">Sort by Rating</option>
              <option value="views">Sort by Views</option>
              <option value="conversion">Sort by Conversion</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading product performance...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {products.length === 0 ? "No Products Found" : "No Products Match Filters"}
            </h3>
            <p className="text-gray-500">
              {products.length === 0 
                ? "Add products to see performance analytics." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        product.name.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
                            <span>{formatCurrency(product.price)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(product.stockLevel)}`}>
                              {product.stockLevel === 0 ? "Out of Stock" : `${product.stockLevel} in stock`}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{formatCurrency(product.totalRevenue)}</div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">{product.totalSold}</span>
                          </div>
                          <div className="text-xs text-gray-600">Units Sold</div>
                          <div className={`flex items-center justify-center gap-1 text-xs ${getGrowthColor(product.salesGrowth)}`}>
                            {getGrowthIcon(product.salesGrowth)}
                            <span>{Math.abs(product.salesGrowth).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-gray-900">{product.views.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-600">Views</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <BarChart3 className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-gray-900">{product.conversionRate.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-600">Conversion</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {renderStars(product.averageRating)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="w-4 h-4 text-orange-600" />
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(product.totalRevenue / Math.max(product.totalSold, 1))}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">Avg Revenue/Unit</div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            <span className={`font-semibold ${getGrowthColor(product.revenueGrowth)}`}>
                              {product.revenueGrowth > 0 ? '+' : ''}{product.revenueGrowth.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">Revenue Growth</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default ProductPerformance;