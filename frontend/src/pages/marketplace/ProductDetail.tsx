import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  Store,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  FileText,
  Shield,
  Zap
} from "lucide-react";

interface ProductDetail {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  vendorBusinessName: string;
  vendorId: string;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  warrantyPeriod?: number;
  safetyDocuments?: string[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/marketplace/products/${id}`
      );

      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      alert(error.response?.data?.message || "Failed to fetch product");
      navigate("/marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!userRole || !["farmer", "landowner"].includes(userRole)) {
      alert("Please login as Farmer or Landowner to add items to cart");
      navigate("/login");
      return;
    }

    if (!product || product.stock < quantity) {
      alert("Insufficient stock");
      return;
    }

    setAddingToCart(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/cart/add`,
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert("Item added to cart successfully!");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!userRole || !["farmer", "landowner"].includes(userRole)) {
      alert("Please login as Farmer or Landowner to purchase");
      navigate("/login");
      return;
    }

    if (!product || product.stock < quantity) {
      alert("Insufficient stock");
      return;
    }

    setAddingToCart(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/cart/add`,
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        navigate("/cart");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const getStockStatusBadge = () => {
    if (!product) return null;

    switch (product.stockStatus) {
      case "OUT_OF_STOCK":
        return {
          label: "Out of Stock",
          color: "bg-red-100 text-red-800",
          icon: PackageX,
        };
      case "LOW_STOCK":
        return {
          label: "Low Stock",
          color: "bg-yellow-100 text-yellow-800",
          icon: AlertTriangle,
        };
      case "IN_STOCK":
        return {
          label: "In Stock",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle2,
        };
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Fertilizers":
        return "bg-green-100 text-green-800";
      case "Pesticides":
        return "bg-red-100 text-red-800";
      case "Equipment & Tools":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">Product not found</div>
      </div>
    );
  }

  const stockBadge = getStockStatusBadge();
  const StatusIcon = stockBadge?.icon;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <button onClick={() => navigate("/marketplace")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Marketplace
        </button>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 sm:mb-4">
                {product.images && product.images.length > 0 ? (
                  <img src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${product.images[selectedImage]}`} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-green-600" : "border-gray-200"}`}>
                      <img src={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${image}`} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                    {stockBadge && (
                      <span className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${stockBadge.color}`}>
                        <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        {stockBadge.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4 sm:mb-6">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Stock: {product.stock} units available
                </p>
              </div>

              {/* Vendor Info */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6 p-3 bg-gray-50 rounded-lg">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Sold by</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {product.vendorBusinessName}
                  </p>
                </div>
              </div>

              {/* Warranty Info */}
              {product.warrantyPeriod && (
                <div className="flex items-center gap-2 mb-4 sm:mb-6 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600">Warranty</p>
                    <p className="text-sm sm:text-base font-semibold text-blue-900">
                      {product.warrantyPeriod} months warranty
                    </p>
                  </div>
                </div>
              )}

              {/* Safety Documents (for Pesticides) */}
              {product.category === "Pesticides" && product.safetyDocuments && product.safetyDocuments.length > 0 && (
                <div className="mb-4 sm:mb-6 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    <p className="text-sm sm:text-base font-semibold text-yellow-900">Safety Documents</p>
                  </div>
                  <div className="space-y-1">
                    {product.safetyDocuments.map((doc, index) => (
                      <a key={index} href={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${doc}`} target="_blank" rel="noopener noreferrer"
                        className="block text-xs sm:text-sm text-yellow-700 hover:text-yellow-900 underline">
                        View Safety Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {!isOutOfStock && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                        className="px-3 sm:px-4 py-2 hover:bg-gray-50 disabled:opacity-50 text-sm sm:text-base">
                        -
                      </button>
                      <input type="number" value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(Math.max(1, val), product.stock));
                        }}
                        min="1" max={product.stock}
                        className="w-16 sm:w-20 text-center border-0 focus:ring-0 text-sm sm:text-base" />
                      <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}
                        className="px-3 sm:px-4 py-2 hover:bg-gray-50 disabled:opacity-50 text-sm sm:text-base">
                        +
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Max: {product.stock} units
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Buy Now Button - Primary */}
                <button 
                  onClick={handleBuyNow} 
                  disabled={isOutOfStock || addingToCart || quantity > product.stock}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 sm:py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 text-sm sm:text-base group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">
                    {addingToCart ? "Processing..." : isOutOfStock ? "Out of Stock" : "Buy Now"}
                  </span>
                </button>

                {/* Add to Cart Button - Secondary */}
                <button 
                  onClick={handleAddToCart} 
                  disabled={isOutOfStock || addingToCart || quantity > product.stock}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-600 py-3 sm:py-3.5 rounded-xl font-semibold hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {addingToCart ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>

              {product.stockStatus === "LOW_STOCK" && (
                <p className="mt-3 text-xs sm:text-sm text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Only {product.stock} units left in stock!</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Product Description
            </h2>
            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

