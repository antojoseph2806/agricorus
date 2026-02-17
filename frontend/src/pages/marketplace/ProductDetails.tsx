import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Shield,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  Package,
  Calendar,
  FileText,
  Building,
  RefreshCw
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
  safetyDocuments: string[];
  warrantyPeriod?: number;
  vendorBusinessName: string;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  createdAt: string;
  isActive: boolean;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org";
      const response = await fetch(`${backendUrl}/api/marketplace/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        console.error('Failed to fetch product:', data.message);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
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
      setAddingToCart(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org";
      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: id, quantity })
      });

      const data = await response.json();
      if (data.success) {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
          navigate('/cart');
        }, 1000);
      } else {
        alert(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getStockStatusBadge = (status: string, stock: number) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800 font-medium">Out of Stock</span>
          </div>
        );
      case 'LOW_STOCK':
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Low Stock ({stock} left)</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-800 font-medium">In Stock ({stock} available)</span>
          </div>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fertilizers':
        return '🌱';
      case 'Pesticides':
        return '🛡️';
      case 'Equipment & Tools':
        return '🔧';
      default:
        return '📦';
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </MarketplaceLayout>
    );
  }

  if (!product) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or is no longer available.</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-4">
            <Link
              to="/marketplace"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Link>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCategoryIcon(product.category)}</span>
              <span className="text-gray-600">{product.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
              <img
                src={
                  product.images[selectedImage] || '/placeholder-product.jpg'
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-emerald-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">by {product.vendorBusinessName}</span>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-4">
                ₹{product.price.toLocaleString()}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              {getStockStatusBadge(product.stockStatus, product.stock)}
            </div>

            {/* Quantity Selector and Add to Cart */}
            {product.stockStatus !== 'OUT_OF_STOCK' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                      (Max: {product.stock})
                    </span>
                  </div>
                </div>

                <button
                  onClick={addToCart}
                  disabled={addingToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-gray-900">Verified Vendor</div>
                  <div className="text-sm text-gray-600">Quality assured</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Truck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-medium text-gray-900">Fast Delivery</div>
                  <div className="text-sm text-gray-600">3-5 business days</div>
                </div>
              </div>

              {product.warrantyPeriod && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-gray-900">Warranty</div>
                    <div className="text-sm text-gray-600">{product.warrantyPeriod} months</div>
                  </div>
                </div>
              )}

              {product.safetyDocuments.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-gray-900">Safety Certified</div>
                    <div className="text-sm text-gray-600">Documents available</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>
        </div>

        {/* Safety Documents (for Pesticides) */}
        {product.safetyDocuments.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.safetyDocuments.map((doc, index) => (
                <a
                  key={index}
                  href={doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-gray-900">Safety Document {index + 1}</div>
                    <div className="text-sm text-gray-600">Click to view</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Product Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="text-gray-900">{product.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Stock:</dt>
                  <dd className="text-gray-900">{product.stock} units</dd>
                </div>
                {product.warrantyPeriod && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Warranty:</dt>
                    <dd className="text-gray-900">{product.warrantyPeriod} months</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600">Listed:</dt>
                  <dd className="text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Vendor Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Business Name:</dt>
                  <dd className="text-gray-900">{product.vendorBusinessName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status:</dt>
                  <dd className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Success Animation Modal */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center animate-bounce">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
            <p className="text-gray-600">
              {!localStorage.getItem('token') 
                ? 'Redirecting to registration...' 
                : 'Redirecting to cart...'}
            </p>
          </div>
        </div>
      )}
    </MarketplaceLayout>
  );
};

export default ProductDetails;