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
  Shield
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
        `https://agricorus.onrender.com/api/marketplace/products/${id}`
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
        "https://agricorus.onrender.com/api/cart/add",
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`https://agricorus.onrender.com${product.images[selectedImage]}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-green-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={`https://agricorus.onrender.com${image}`}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                        product.category
                      )}`}
                    >
                      {product.category}
                    </span>
                    {stockBadge && (
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${stockBadge.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {stockBadge.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Stock: {product.stock} units available
                </p>
              </div>

              {/* Vendor Info */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
                <Store className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Sold by</p>
                  <p className="font-semibold text-gray-900">
                    {product.vendorBusinessName}
                  </p>
                </div>
              </div>

              {/* Warranty Info */}
              {product.warrantyPeriod && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Warranty</p>
                    <p className="font-semibold text-blue-900">
                      {product.warrantyPeriod} months warranty
                    </p>
                  </div>
                </div>
              )}

              {/* Safety Documents (for Pesticides) */}
              {product.category === "Pesticides" && product.safetyDocuments && product.safetyDocuments.length > 0 && (
                <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-yellow-600" />
                    <p className="font-semibold text-yellow-900">Safety Documents</p>
                  </div>
                  <div className="space-y-1">
                    {product.safetyDocuments.map((doc, index) => (
                      <a
                        key={index}
                        href={`https://agricorus.onrender.com${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-yellow-700 hover:text-yellow-900 underline"
                      >
                        View Safety Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {!isOutOfStock && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.min(Math.max(1, val), product.stock));
                        }}
                        min="1"
                        max={product.stock}
                        className="w-20 text-center border-0 focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Max: {product.stock} units
                    </p>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart || quantity > product.stock}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart
                  ? "Adding to Cart..."
                  : isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              {product.stockStatus === "LOW_STOCK" && (
                <p className="mt-2 text-sm text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Only {product.stock} units left in stock!
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

