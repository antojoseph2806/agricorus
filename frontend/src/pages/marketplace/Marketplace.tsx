import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Eye,
  Package,
  Grid3X3,
  List,
  SlidersHorizontal,
  Loader2,
  Leaf,
  Shield,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle
} from 'lucide-react';
import MarketplaceLayout from '../../components/MarketplaceLayout';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  vendorBusinessName: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  createdAt: string;
}

interface Filters {
  category: string;
  search: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: string;
}

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🛒', color: 'bg-gray-100 text-gray-700' },
    { value: 'Fertilizers', label: 'Fertilizers', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'Pesticides', label: 'Pesticides', icon: '🛡️', color: 'bg-blue-100 text-blue-700' },
    { value: 'Equipment & Tools', label: 'Equipment', icon: '🔧', color: 'bg-amber-100 text-amber-700' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' }
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`https://agricorus.onrender.com/api/marketplace/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.totalProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
    setCurrentPage(1);
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // If not logged in, show success animation then redirect to register
    if (!token) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        navigate('/register');
      }, 1500);
      return;
    }
    
    // Check if user has valid role for marketplace
    const validRoles = ['farmer', 'landowner', 'investor'];
    if (!role || !validRoles.includes(role)) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        navigate('/register');
      }, 1500);
      return;
    }

    // User is logged in with valid role, proceed with actual cart addition
    try {
      setAddingToCart(productId);
      const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'https://agricorus.onrender.com';
      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 1000);
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const buyNow = async (productId: string) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // If not logged in, show success animation then redirect to register
    if (!token) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        navigate('/register');
      }, 1500);
      return;
    }
    
    // Check if user has valid role for marketplace
    const validRoles = ['farmer', 'landowner', 'investor'];
    if (!role || !validRoles.includes(role)) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        setShowSuccessAnimation(false);
        navigate('/register');
      }, 1500);
      return;
    }

    // User is logged in with valid role, proceed with buy now
    try {
      setAddingToCart(productId);
      const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'https://agricorus.onrender.com';
      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const data = await response.json();
      if (data.success) {
        navigate('/cart');
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing request');
    } finally {
      setAddingToCart(null);
    }
  };

  const getStockBadge = (status: string, stock: number) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">Out of Stock</span>;
      case 'LOW_STOCK':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Only {stock} left</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">In Stock</span>;
    }
  };

  const getCategoryStyle = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? { icon: cat.icon, color: cat.color } : { icon: '📦', color: 'bg-gray-100 text-gray-700' };
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.category !== 'all' || filters.search || filters.minPrice || filters.maxPrice;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Gradient Header Banner - Matching ViewLands */}
        <div className="relative mb-6 sm:mb-8">
          <div className="h-40 sm:h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-none sm:rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8" />
                AgriMarket
              </h1>
              <p className="text-sm sm:text-base text-emerald-100">Quality agricultural products from verified vendors</p>
            </div>
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2">
              <Link to="/orders" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition backdrop-blur-sm">
                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Orders</span>
              </Link>
              <Link to="/cart" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-emerald-600 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-50 transition shadow-lg">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5" />
                <span>Cart</span>
              </Link>
            </div>
          </div>

          {/* Icon Badge */}
          <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mt-12 sm:mt-16 mb-6 sm:mb-8 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Browse Products</h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Discover quality agricultural supplies</p>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-300 text-sm sm:text-base text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Quality</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Best Price</span>
              </div>
            </div>
          </div>
          {/* Category Pills */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleFilterChange('category', cat.value)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  filters.category === cat.value
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-sm sm:text-base">{cat.icon}</span>
                <span>{cat.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Filters Bar - Matching ViewLands style */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Sort */}
              <div className="flex-1 min-w-0">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition ${
                  showFilters ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Filter</span>
              </button>

              {/* View Toggle - Hidden on mobile */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Price Range */}
            {showFilters && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-500">Price Range:</span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="flex-1 sm:w-24 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="flex-1 sm:w-24 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{products.length}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalProducts}</span> products
            </p>
          </div>

          {/* Products */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5" 
              : "space-y-3 sm:space-y-4"
            }>
              {products.map((product) => {
                const catStyle = getCategoryStyle(product.category);
                return viewMode === 'grid' ? (
                  // Grid Card
                  <div
                    key={product._id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-50 overflow-hidden">
                      <img
                        src={product.images[0] ? `https://agricorus.onrender.com${product.images[0]}` : '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        {getStockBadge(product.stockStatus, product.stock)}
                      </div>
                      <Link
                        to={`/marketplace/product/${product._id}`}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </Link>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 ${catStyle.color}`}>
                        <span className="text-xs">{catStyle.icon}</span>
                        {product.category}
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">by {product.vendorBusinessName}</p>

                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-bold text-emerald-600">
                          ₹{product.price.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => buyNow(product._id)}
                          disabled={product.stockStatus === 'OUT_OF_STOCK' || addingToCart === product._id}
                          className="flex-1 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                          {addingToCart === product._id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            'Buy Now'
                          )}
                        </button>
                        <button
                          onClick={() => addToCart(product._id)}
                          disabled={product.stockStatus === 'OUT_OF_STOCK' || addingToCart === product._id}
                          className="w-10 h-9 flex items-center justify-center border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List Card
                  <div
                    key={product._id}
                    className="bg-white rounded-xl border border-gray-100 p-3 flex gap-3 hover:shadow-lg hover:border-emerald-200 transition-all"
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={product.images[0] ? `https://agricorus.onrender.com${product.images[0]}` : '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${catStyle.color}`}>
                            <span className="text-xs">{catStyle.icon}</span>
                            {product.category}
                          </div>
                          <h3 className="font-semibold text-gray-800 text-sm mb-0.5">{product.name}</h3>
                          <p className="text-xs text-gray-500">by {product.vendorBusinessName}</p>
                        </div>
                        {getStockBadge(product.stockStatus, product.stock)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-lg font-bold text-emerald-600">₹{product.price.toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/marketplace/product/${product._id}`}
                            className="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => buyNow(product._id)}
                            disabled={product.stockStatus === 'OUT_OF_STOCK' || addingToCart === product._id}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                          >
                            {addingToCart === product._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Buy Now'
                            )}
                          </button>
                          <button
                            onClick={() => addToCart(product._id)}
                            disabled={product.stockStatus === 'OUT_OF_STOCK' || addingToCart === product._id}
                            className="w-8 h-8 flex items-center justify-center border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-medium transition ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Animation Modal */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4 text-center animate-bounce">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {!localStorage.getItem('token') 
                ? 'Redirecting to registration...' 
                : 'Item added successfully!'}
            </p>
          </div>
        </div>
      )}
    </MarketplaceLayout>
  );
};

export default Marketplace;
