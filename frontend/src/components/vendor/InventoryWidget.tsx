import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  IndianRupee,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

interface InventoryOverview {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: string;
}

interface StockAlert {
  _id: string;
  name: string;
  stock: number;
  alertType: string;
  message: string;
}

const InventoryWidget = () => {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const [overviewRes, alertsRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory/alerts`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data.overview);
      }

      if (alertsRes.data.success) {
        const allAlerts = [
          ...alertsRes.data.data.lowStockProducts,
          ...alertsRes.data.data.outOfStockProducts
        ];
        setAlerts(allAlerts.slice(0, 3)); // Show only top 3 alerts
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Package className="w-5 h-5 mr-2 text-green-600" />
          Inventory Overview
        </h3>
        <Link 
          to="/vendor/inventory"
          className="text-green-600 hover:text-green-700 text-sm flex items-center"
        >
          View All
          <ExternalLink className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {overview && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{overview.totalProducts}</div>
            <div className="text-xs text-blue-600">Total Products</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
              {parseFloat(overview.totalStockValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-green-600">Stock Value</div>
          </div>
        </div>
      )}

      {/* Stock Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
            Stock Alerts ({alerts.length})
          </h4>
          
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert._id} 
                className={`flex items-center justify-between p-2 rounded text-sm ${
                  alert.alertType === 'OUT_OF_STOCK' 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {alert.alertType === 'OUT_OF_STOCK' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                  <div>
                    <div className="font-medium truncate max-w-32">{alert.name}</div>
                    <div className="text-xs opacity-75">{alert.message}</div>
                  </div>
                </div>
                <div className="text-xs font-medium">
                  {alert.stock}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {overview && (overview.lowStockCount > 0 || overview.outOfStockCount > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            {overview.lowStockCount > 0 && (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {overview.lowStockCount} Low Stock
              </div>
            )}
            {overview.outOfStockCount > 0 && (
              <div className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                {overview.outOfStockCount} Out of Stock
              </div>
            )}
          </div>
        </div>
      )}

      {alerts.length === 0 && overview && overview.lowStockCount === 0 && overview.outOfStockCount === 0 && (
        <div className="text-center py-4">
          <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-green-600 font-medium">All products in stock!</p>
          <p className="text-xs text-gray-500">No stock alerts at this time</p>
        </div>
      )}
    </div>
  );
};

export default InventoryWidget;