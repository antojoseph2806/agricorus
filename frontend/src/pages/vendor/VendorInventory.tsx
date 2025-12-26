import { useState, useEffect } from "react";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Edit3,
  Save,
  X,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  IndianRupee,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  stockStatus: string;
  stockValue: string;
}

interface InventoryOverview {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: string;
}

interface StockAlert {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  alertType: string;
  message: string;
}

interface StockMovement {
  date: string;
  productId: string;
  productName: string;
  type: string;
  quantity: number;
  orderId?: string;
  orderNumber?: string;
  buyerName?: string;
  reason: string;
}

const VendorInventory = () => {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [newThreshold, setNewThreshold] = useState<number>(10);
  const [stockReason, setStockReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [overviewRes, alertsRes, movementsRes] = await Promise.all([
        axios.get(
          `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory/alerts`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory/movements`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data.overview);
        setProducts(overviewRes.data.data.products);
      }

      if (alertsRes.data.success) {
        setAlerts([
          ...alertsRes.data.data.lowStockProducts,
          ...alertsRes.data.data.outOfStockProducts
        ]);
      }

      if (movementsRes.data.success) {
        setMovements(movementsRes.data.data.movements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string) => {
    if (newStock < 0) {
      alert("Stock cannot be negative");
      return;
    }

    if (newThreshold < 0) {
      alert("Low stock threshold cannot be negative");
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.patch(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory/${productId}/stock`,
        {
          stock: newStock,
          lowStockThreshold: newThreshold,
          reason: stockReason.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert("Stock updated successfully!");
        setEditingProduct(null);
        setNewStock(0);
        setNewThreshold(10);
        setStockReason("");
        fetchInventoryData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return "bg-red-100 text-red-800";
      case "LOW_STOCK":
        return "bg-yellow-100 text-yellow-800";
      case "IN_STOCK":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return <XCircle className="w-4 h-4" />;
      case "LOW_STOCK":
        return <AlertTriangle className="w-4 h-4" />;
      case "IN_STOCK":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || product.category === categoryFilter;
    const matchesStock = stockFilter === "ALL" || product.stockStatus === stockFilter;
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock & Inventory Control</h1>
          <p className="text-gray-600">Monitor and manage your product inventory</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">{overview.lowStockCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{overview.outOfStockCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stock Value</p>
                  <p className="text-2xl font-bold text-green-600 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {overview.totalStockValue}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Inventory Overview", icon: Package },
                { id: "alerts", label: "Stock Alerts", icon: AlertTriangle },
                { id: "movements", label: "Stock Movements", icon: TrendingDown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Equipment & Tools">Equipment & Tools</option>
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ALL">All Stock Status</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>

                <button
                  onClick={fetchInventoryData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Low Stock Alert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProduct === product._id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                value={newStock}
                                onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Stock"
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">{product.stock}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingProduct === product._id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                value={newThreshold}
                                onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Threshold"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              Alert when ≤ {product.lowStockThreshold}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            {product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <IndianRupee className="w-4 h-4" />
                            {product.stockValue}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(product.stockStatus)}`}>
                            {getStockStatusIcon(product.stockStatus)}
                            <span>{product.stockStatus.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingProduct === product._id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={stockReason}
                                onChange={(e) => setStockReason(e.target.value)}
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                              <button
                                onClick={() => handleUpdateStock(product._id)}
                                disabled={updating}
                                className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(null);
                                  setNewStock(0);
                                  setNewThreshold(10);
                                  setStockReason("");
                                }}
                                disabled={updating}
                                className="text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingProduct(product._id);
                                setNewStock(product.stock);
                                setNewThreshold(product.lowStockThreshold);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
              <p className="text-sm text-gray-500">Products requiring immediate attention</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stock alerts</h3>
                  <p className="text-gray-500">All your products have adequate stock levels.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert._id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${alert.alertType === 'OUT_OF_STOCK' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        {alert.alertType === 'OUT_OF_STOCK' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{alert.name}</h4>
                        <p className="text-sm text-gray-500">{alert.category}</p>
                        <p className={`text-sm font-medium ${alert.alertType === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("overview");
                        setEditingProduct(alert._id);
                        setNewStock(alert.stock);
                        setNewThreshold(10); // Default threshold
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Update Stock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "movements" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Stock Movements</h3>
              <p className="text-sm text-gray-500">Recent stock changes and transactions</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {movements.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent movements</h3>
                  <p className="text-gray-500">Stock movements will appear here when orders are processed.</p>
                </div>
              ) : (
                movements.map((movement, index) => (
                  <div key={index} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${movement.type === 'SALE' ? 'bg-red-100' : 'bg-green-100'}`}>
                        {movement.type === 'SALE' ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <Package className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{movement.productName}</h4>
                        <p className="text-sm text-gray-500">{movement.reason}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(movement.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </p>
                      {movement.orderNumber && (
                        <p className="text-xs text-gray-500">Order: {movement.orderNumber}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorInventory;