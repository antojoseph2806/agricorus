import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import MarketplaceLayout from '../../components/MarketplaceLayout';

interface CartItem {
  productId: string;
  productName: string;
  category: string;
  price: number;
  priceAtAddTime: number;
  quantity: number;
  stock: number;
  image: string | null;
  vendorId: string;
  vendorBusinessName: string;
  subtotal: number;
  isAvailable: boolean;
  maxQuantity: number;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  itemCount: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      // Set user role for validation
      setUserRole(role);
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      } else {
        console.error('Failed to fetch cart:', data.message);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    try {
      setUpdating(productId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendUrl}/api/cart/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });

      const data = await response.json();
      if (data.success) {
        await fetchCart(); // Refresh cart
      } else {
        alert(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendUrl}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchCart(); // Refresh cart
      } else {
        alert(data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item');
    } finally {
      setUpdating(null);
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
    fetchCart();
  }, []);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/marketplace"
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              </div>
            </div>
            <Link
              to="/orders"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Package className="w-4 h-4" />
              Order History
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Package className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cart Items ({cart.totalItems} items)
                </h2>
                
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={item.productId}
                      className={`flex gap-4 p-4 border rounded-lg ${
                        !item.isAvailable ? 'bg-red-50 border-red-200' : 'border-gray-200'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image ? `${backendUrl}${item.image}` : '/placeholder-product.jpg'}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{getCategoryIcon(item.category)}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900">{item.productName}</h3>
                            <p className="text-sm text-gray-600">by {item.vendorBusinessName}</p>
                            
                            {!item.isAvailable && (
                              <div className="flex items-center gap-1 mt-2 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">Currently unavailable</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            disabled={updating === item.productId}
                            className="p-2 text-gray-400 hover:text-red-600 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={updating === item.productId || item.quantity <= 1}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 border border-gray-300 rounded min-w-[50px] text-center">
                              {updating === item.productId ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={updating === item.productId || item.quantity >= item.maxQuantity}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <span className="text-xs text-gray-500">
                              (Max: {item.maxQuantity})
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              ₹{item.subtotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              ₹{item.priceAtAddTime.toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cart.totalItems})</span>
                    <span className="text-gray-900">₹{cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-emerald-600">
                        ₹{cart.subtotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="mt-6">
                  {cart.items.some(item => !item.isAvailable) ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Some items are unavailable</span>
                      </div>
                      <button
                        disabled
                        className="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                      >
                        Cannot Proceed to Checkout
                      </button>
                    </div>
                  ) : !userRole || !['farmer', 'landowner', 'investor'].includes(userRole) ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">
                          {userRole ? 'Invalid account type for marketplace' : 'Authentication required'}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate('/checkout')}
                        className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                      >
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Continue to Authentication
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/checkout"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      <CreditCard className="w-4 h-4" />
                      Proceed to Checkout
                    </Link>
                  )}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Secure Checkout</span>
                </div>
                <p className="text-sm text-green-700">
                  Your payment information is encrypted and secure. All products are from verified vendors.
                </p>
              </div>

              {/* Continue Shopping */}
              <div className="text-center">
                <Link
                  to="/marketplace"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};

export default Cart;