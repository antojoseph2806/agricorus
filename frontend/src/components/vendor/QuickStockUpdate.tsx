import { useState } from "react";
import axios from "axios";
import { X, Save, Package } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
}

interface QuickStockUpdateProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const QuickStockUpdate = ({ product, isOpen, onClose, onUpdate }: QuickStockUpdateProps) => {
  const [newStock, setNewStock] = useState(product.stock);
  const [newThreshold, setNewThreshold] = useState(product.lowStockThreshold);
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
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
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/inventory/${product._id}/stock`,
        {
          stock: newStock,
          lowStockThreshold: newThreshold,
          reason: reason.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert("Stock updated successfully!");
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-600" />
            Update Stock
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {product.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock: {product.stock}
            </label>
            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter new stock quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              min="0"
              value={newThreshold}
              onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Alert when stock is at or below this number"
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll get alerts when stock reaches this level or below
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Reason for stock update..."
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{updating ? "Updating..." : "Update Stock"}</span>
          </button>
          <button
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickStockUpdate;