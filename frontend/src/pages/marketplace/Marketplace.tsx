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
  CheckCircle,
  Filter
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
    { value: 'all', label: 'All', icon: '🛒', color: 'bg-gray-100 text-gray-700' },
    { value: 'Fertilizers', label: 'Fertilizers', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'Pesticides', label: 'Pesticides', icon: '🛡️', color: 'bg-blue-100 text-blue-700' },
    { value: 'Equipment & Tools', label: 'Tools', icon: '🔧', color: 'bg-amber-100 text-amber-700' }
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/marketplace/products?${params}`);
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

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem('token');
    
    // If not logged in, store in local storage
    if (!token) {
      try {
        setAddingToCart(productId);
        
        // Get existing guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        
        // Check if product already exists
        const existingIndex = guestCart.findIndex((item: any) => item.productId === productId);
        
        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += 1;
        } else {
          guestCart.push({ productId, quantity: 1 });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
      } catch (err) {
        console.error(err);
      } finally {
        setAddingToCart(null);
      }
      return;
    }
    
    // If logged in, add to server cart
    try {
      setAddingToCart(productId);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/cart/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const data = await response.json();
      if (data.success) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 1500);
      }
    } catch (err) { console.error(err); } finally { setAddingToCart(null); }
  };

  const buyNow = async (productId: string) => {
    const token = localStorage.getItem('token');
    
    // If not logged in, store in local storage and redirect to login
    if (!token) {
      try {
        setAddingToCart(productId);
        
        // Get existing guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        
        // Check if product already exists
        const existingIndex = guestCart.findIndex((item: any) => item.productId === productId);
        
        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += 1;
        } else {
          guestCart.push({ productId, quantity: 1 });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        
        // Redirect to register/login
        navigate('/register');
      } catch (err) {
        console.error(err);
      } finally {
        setAddingToCart(null);
      }
      return;
    }
    
    // If logged in, add to cart and navigate
    try {
      setAddingToCart(productId);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/cart/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      const data = await response.json();
      if (data.success) {
        navigate('/cart');
      }
    } catch (err) { console.error(err); } finally { setAddingToCart(null); }
  };

  useEffect(() => { fetchProducts(); }, [currentPage, filters]);

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-white w-full overflow-x-hidden">
        
        {/* Search Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4">
          <div className="relative max-w-7xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search seeds, tools, fertilizers..."
              value={filters.search}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20"
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="px-4 py-4 flex gap-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange('category', cat.value)}
              className={`flex flex-col items-center gap-1.5 min-w-[70px] transition-all ${
                filters.category === cat.value ? 'scale-105' : 'opacity-60'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${
                filters.category === cat.value ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-800'
              }`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-600">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="px-4 pb-20 max-w-7xl mx-auto">
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {totalProducts} Items Found
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-700 border border-gray-100"
            >
              <Filter size={14} /> Filter
            </button>
          </div>

          {/* Product Feed - Single Column on XS Mobile, 2 on SM */}
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase">Fetching Marketplace...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-t-2xl sm:rounded-t-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img 
                      src={product.images[0] || '/placeholder.jpg'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={product.name}
                    />
                    
                    {/* Stock Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                      {product.stockStatus === 'IN_STOCK' && (
                        <span className="bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-lg">In Stock</span>
                      )}
                      {product.stockStatus === 'LOW_STOCK' && (
                        <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-lg">Low Stock</span>
                      )}
                      {product.stockStatus === 'OUT_OF_STOCK' && (
                        <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-lg">Sold Out</span>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Link
                      to={`/marketplace/product/${product._id}`}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white z-10"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </Link>

                    {product.stockStatus === 'OUT_OF_STOCK' && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-gray-900 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase shadow-xl">Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5 sm:p-3 lg:p-4 flex-1 flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{product.category}</span>
                    <h3 className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">{product.name}</h3>
                    <p className="text-[9px] sm:text-xs text-gray-500 mb-2 truncate">by {product.vendorBusinessName}</p>
                    
                    <div className="flex items-baseline gap-1 sm:gap-2 mb-3 mt-auto">
                      <span className="text-base sm:text-lg lg:text-xl font-black text-emerald-600">₹{product.price.toLocaleString()}</span>
                      {product.stockStatus === 'LOW_STOCK' && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-amber-600 uppercase">Only {product.stock}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          buyNow(product._id);
                        }}
                        disabled={product.stockStatus === 'OUT_OF_STOCK' || addingToCart === product._id}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg relative z-10"
                      >
                        {addingToCart === product._id ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" />
                        ) : (
                          'Buy Now'
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product._id);
                        }}
                        disabled={product.stockStatus === 'OUT_OF_STOCK' || addingToCart === product._id}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm relative z-10"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-3 bg-gray-50 rounded-2xl disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="flex items-center px-4 font-black text-gray-900">{currentPage} / {totalPages}</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 bg-gray-50 rounded-2xl disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Success Toast */}
      {showSuccessAnimation && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-400" size={20} />
              <span className="text-sm font-bold">Added to cart!</span>
            </div>
            <Link to="/cart" className="text-xs font-black text-emerald-400 uppercase underline">View Cart</Link>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </MarketplaceLayout>
  );
};

export default Marketplace;