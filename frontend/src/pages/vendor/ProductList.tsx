import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import { Plus, Edit, Trash2, Package, PackageX, AlertTriangle, CheckCircle2, X } from "lucide-react";

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
  isActive: boolean;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  createdAt: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [kycStatus, setKycStatus] = useState<"PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchKYCStatus();
  }, [filter]);

  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://agricorus.onrender.com/api/vendor/profile/status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setKycStatus(res.data.data.kycStatus);
      }
    } catch (error: any) {
      console.error("Error fetching KYC status:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        filter === "all"
          ? "https://agricorus.onrender.com/api/vendor/products"
          : `https://agricorus.onrender.com/api/vendor/products?isActive=${filter === "active"}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      alert(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://agricorus.onrender.com/api/vendor/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete product");
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

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return "OUT_OF_STOCK";
    if (product.stock < 10) return "LOW_STOCK";
    return "IN_STOCK";
  };

  const getStockStatusBadge = (product: Product) => {
    const status = product.stockStatus || getStockStatus(product);
    switch (status) {
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
        return {
          label: "Unknown",
          color: "bg-gray-100 text-gray-800",
          icon: Package,
        };
    }
  };

  const handleUpdateInventory = (product: Product) => {
    setSelectedProduct(product);
    setShowInventoryModal(true);
  };

  const handleToggleActive = async (product: Product) => {
    // Check KYC status before activating
    if (!product.isActive && kycStatus !== "VERIFIED") {
      alert("Please complete KYC verification to activate products. Go to Profile & KYC to complete verification.");
      navigate("/vendor/profile");
      return;
    }

    if (!confirm(`Are you sure you want to ${product.isActive ? "deactivate" : "activate"} this product?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `https://agricorus.onrender.com/api/vendor/products/${product._id}/inventory`,
        { isActive: !product.isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert(`Product ${product.isActive ? "deactivated" : "activated"} successfully`);
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update product status");
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        {/* KYC Status Banner */}
        {kycStatus !== "VERIFIED" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base">
                  Complete KYC to activate products & receive orders
                </p>
              </div>
              <button
                onClick={() => navigate("/vendor/profile")}
                className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm sm:text-base whitespace-nowrap"
              >
                Complete KYC
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Products</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Total Products: {products.length}
            </p>
          </div>
          <button
            onClick={() => navigate("/vendor/products/add")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${
              filter === "active"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${
              filter === "inactive"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-base sm:text-lg">No products found</p>
            <button
              onClick={() => navigate("/vendor/products/add")}
              className="mt-4 text-green-600 hover:underline text-sm sm:text-base"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => {
              const stockStatusBadge = getStockStatusBadge(product);
              const StatusIcon = stockStatusBadge.icon;
              const isLowStock = getStockStatus(product) === "LOW_STOCK" || getStockStatus(product) === "OUT_OF_STOCK";

              return (
                <div
                  key={product._id}
                  className={`bg-white rounded-lg shadow hover:shadow-lg transition ${
                    isLowStock ? "ring-2 ring-yellow-300" : ""
                  } ${!product.isActive ? "opacity-60" : ""}`}
                >
                  {/* Product Image */}
                  <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`https://agricorus.onrender.com${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {/* Stock Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${stockStatusBadge.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {stockStatusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-2 min-w-0 flex-1">
                        {product.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs flex-shrink-0 whitespace-nowrap ${getCategoryColor(
                          product.category
                        )}`}
                      >
                        {product.category}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                      {product.description || "No description"}
                    </p>

                    <div className="flex justify-between items-center mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xl sm:text-2xl font-bold text-green-600">
                          ₹{product.price.toLocaleString()}
                        </p>
                        <p className={`text-xs sm:text-sm font-medium ${
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock < 10
                            ? "text-yellow-600"
                            : "text-gray-500"
                        }`}>
                          Stock: {product.stock}
                        </p>
                      </div>
                      {product.warrantyPeriod && (
                        <p className="text-xs text-blue-600 flex-shrink-0">
                          {product.warrantyPeriod}mo warranty
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleUpdateInventory(product)}
                        className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded hover:bg-green-100 font-medium text-sm"
                      >
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">Update Inventory</span>
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/vendor/products/edit/${product._id}`)}
                          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-blue-50 text-blue-600 px-2 sm:px-3 py-2 rounded hover:bg-blue-100 text-sm"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleActive(product)}
                          disabled={!product.isActive && kycStatus !== "VERIFIED"}
                          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded text-sm ${
                            product.isActive
                              ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              : kycStatus === "VERIFIED"
                              ? "bg-green-50 text-green-600 hover:bg-green-100"
                              : "bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {product.isActive ? (
                            <>
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Activate</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex items-center justify-center gap-1 sm:gap-2 bg-red-50 text-red-600 px-2 sm:px-3 py-2 rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>

                    {!product.isActive && (
                      <p className="text-xs text-red-600 mt-2 text-center font-medium">
                        Inactive
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inventory Update Modal */}
        {showInventoryModal && selectedProduct && (
          <InventoryUpdateModal
            product={selectedProduct}
            onClose={() => {
              setShowInventoryModal(false);
              setSelectedProduct(null);
            }}
            onUpdate={async (data) => {
              setUpdating(true);
              try {
                const token = localStorage.getItem("token");
                const res = await axios.patch(
                  `https://agricorus.onrender.com/api/vendor/products/${selectedProduct._id}/inventory`,
                  data,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );

                if (res.data.success) {
                  alert("Inventory updated successfully!");
                  fetchProducts();
                  setShowInventoryModal(false);
                  setSelectedProduct(null);
                }
              } catch (error: any) {
                alert(error.response?.data?.message || "Failed to update inventory");
              } finally {
                setUpdating(false);
              }
            }}
            updating={updating}
          />
        )}
      </div>
    </VendorLayout>
  );
};

// Inventory Update Modal Component
interface InventoryUpdateModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: (data: { stock?: number; price?: number; isActive?: boolean }) => Promise<void>;
  updating: boolean;
}

const InventoryUpdateModal = ({
  product,
  onClose,
  onUpdate,
  updating,
}: InventoryUpdateModalProps) => {
  const [formData, setFormData] = useState({
    stock: product.stock.toString(),
    price: product.price.toString(),
    isActive: product.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stock = parseInt(formData.stock);
    const price = parseFloat(formData.price);

    if (stock < 0) {
      alert("Stock cannot be negative");
      return;
    }

    if (price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    await onUpdate({
      stock,
      price,
      isActive: formData.isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Update Inventory
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">Product:</p>
            <p className="font-semibold text-gray-800">{product.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {product.stock} units
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: ₹{product.price.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Product is Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Inventory"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductList;

