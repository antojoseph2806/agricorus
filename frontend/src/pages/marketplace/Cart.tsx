import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Loader2,
  Shield,
  Truck,
  Tag,
  ChevronRight,
  Sparkles
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
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      setUserRole(role);
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        const quantities: Record<string, number> = {};
        data.data.items.forEach((item: CartItem) => {
          quantities[item.productId] = item.quantity;
        });
        setLocalQuantities(quantities);
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity })
      });

      const data = await response.json();
      if (data.success) {
        await fetchCart();
      } else {
        if (cart) {
          const item = cart.items.find(i => i.productId === productId);
          if (item) setLocalQuantities(prev => ({ ...prev, [productId]: item.quantity }));
        }
        alert(data.message || 'Failed to update quantity');
      }
    } catch {
      if (cart) {
        const item = cart.items.find(i => i.productId === productId);
        if (item) setLocalQuantities(prev => ({ ...prev, [productId]: item.quantity }));
      }
    } finally {
      setUpdating(null);
    }
  };

  const debouncedUpdateQuantity = useCallback((productId: string, newQuantity: number, maxQuantity: number) => {
    if (debounceTimers.current[productId]) clearTimeout(debounceTimers.current[productId]);
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setLocalQuantities(prev => ({ ...prev, [productId]: validQuantity }));
    debounceTimers.current[productId] = setTimeout(() => updateQuantity(productId, validQuantity), 500);
  }, [cart]);

  const handleQuantityInputChange = (productId: string, value: string, maxQuantity: number) => {
    const numValue = parseInt(value, 10);
    if (value === '') {
      setLocalQuantities(prev => ({ ...prev, [productId]: 0 }));
      return;
    }
    if (isNaN(numValue)) return;
    const clampedValue = Math.max(1, Math.min(numValue, maxQuantity));
    debouncedUpdateQuantity(productId, clampedValue, maxQuantity);
  };

  const handleQuantityBlur = (productId: string, maxQuantity: number) => {
    const currentValue = localQuantities[productId];
    if (!currentValue || currentValue < 1) debouncedUpdateQuantity(productId, 1, maxQuantity);
  };

  const handleQuantityButton = (productId: string, delta: number, currentQuantity: number, maxQuantity: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) debouncedUpdateQuantity(productId, newQuantity, maxQuantity);
  };

  useEffect(() => {
    return () => { Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer)); };
  }, []);

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${backendUrl}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (data.success) await fetchCart();
      else alert(data.message || 'Failed to remove item');
    } catch {
      alert('Error removing item');
    } finally {
      setUpdating(null);
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Fertilizers': return { icon: '🌱', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'Pesticides': return { icon: '🛡️', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'Equipment & Tools': return { icon: '🔧', bg: 'bg-amber-100', text: 'text-amber-700' };
      default: return { icon: '📦', bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + ((localQuantities[item.productId] || item.quantity) * item.priceAtAddTime), 0);
  };

  const calculateTotalItems = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + (localQuantities[item.productId] || item.quantity), 0);
  };

  useEffect(() => { fetchCart(); }, []);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      </MarketplaceLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-6">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
              <Link to="/marketplace" className="flex items-center gap-2 text-emerald-100 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Looks like you haven't added any products yet</p>
              <Link to="/marketplace" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
                <Sparkles className="w-5 h-5" /> Browse Products
              </Link>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const hasUnavailableItems = cart.items.some(item => !item.isAvailable);

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/marketplace" className="flex items-center gap-2 text-emerald-100 hover:text-white transition">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Continue Shopping</span>
                </Link>
                <div className="w-px h-6 bg-emerald-400/50" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Shopping Cart</h1>
                    <p className="text-emerald-100 text-sm">{calculateTotalItems()} items</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition">
                  <Package className="w-4 h-4" /> Orders
                </Link>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-white font-medium"><ShoppingCart className="w-4 h-4" /> Cart</span>
              <ChevronRight className="w-4 h-4 text-emerald-300" />
              <span className="flex items-center gap-1 text-emerald-200"><CreditCard className="w-4 h-4" /> Checkout</span>
              <ChevronRight className="w-4 h-4 text-emerald-300" />
              <span className="flex items-center gap-1 text-emerald-200"><Package className="w-4 h-4" /> Done</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => {
                const catStyle = getCategoryStyle(item.category);
                const qty = localQuantities[item.productId] || item.quantity;
                const itemTotal = qty * item.priceAtAddTime;

                return (
                  <div key={item.productId}
                    className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                      !item.isAvailable ? 'border-red-200 bg-red-50/50' : 'border-gray-100 hover:border-emerald-200 hover:shadow-lg'
                    }`}>
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link to={`/marketplace/product/${item.productId}`} className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img src={item.image ? `${backendUrl}${item.image}` : '/placeholder-product.jpg'}
                          alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catStyle.bg} ${catStyle.text}`}>
                              {catStyle.icon} {item.category}
                            </span>
                            <Link to={`/marketplace/product/${item.productId}`}>
                              <h3 className="font-semibold text-gray-800 mt-1 hover:text-emerald-600 transition line-clamp-1">{item.productName}</h3>
                            </Link>
                            <p className="text-sm text-gray-500">by {item.vendorBusinessName}</p>
                          </div>
                          <button onClick={() => removeItem(item.productId)} disabled={updating === item.productId}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            {updating === item.productId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>

                        {!item.isAvailable && (
                          <div className="flex items-center gap-1.5 mt-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" /> Currently unavailable
                          </div>
                        )}

                        {/* Quantity & Price Row */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-100 rounded-lg">
                              <button onClick={() => handleQuantityButton(item.productId, -1, qty, item.maxQuantity)}
                                disabled={updating === item.productId || qty <= 1}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition rounded-l-lg hover:bg-gray-200">
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <input type="number" min="1" max={item.maxQuantity} value={qty}
                                  onChange={(e) => handleQuantityInputChange(item.productId, e.target.value, item.maxQuantity)}
                                  onBlur={() => handleQuantityBlur(item.productId, item.maxQuantity)}
                                  className="w-12 h-8 text-center bg-transparent font-medium text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                {updating === item.productId && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                  </div>
                                )}
                              </div>
                              <button onClick={() => handleQuantityButton(item.productId, 1, qty, item.maxQuantity)}
                                disabled={updating === item.productId || qty >= item.maxQuantity}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition rounded-r-lg hover:bg-gray-200">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="text-xs text-gray-400">Max {item.maxQuantity}</span>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">₹{itemTotal.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">₹{item.priceAtAddTime.toLocaleString()} each</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-6">
                <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800">Order Summary</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({calculateTotalItems()} items)</span>
                      <span className="text-gray-800 font-medium">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-emerald-600">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="mt-5">
                    {hasUnavailableItems ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-red-600 mb-3 text-sm">
                          <AlertCircle className="w-4 h-4" /> Remove unavailable items to proceed
                        </div>
                        <button disabled className="w-full py-3.5 bg-gray-200 text-gray-500 rounded-xl font-medium cursor-not-allowed">
                          Cannot Checkout
                        </button>
                      </div>
                    ) : !userRole || !['farmer', 'landowner', 'investor'].includes(userRole) ? (
                      <button onClick={() => navigate('/checkout')}
                        className="w-full py-3.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" /> Continue to Login
                      </button>
                    ) : (
                      <Link to="/checkout"
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                        <CreditCard className="w-5 h-5" /> Proceed to Checkout
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure Checkout</span>
                </div>
                <p className="text-xs text-emerald-600">Your payment is encrypted and secure. All vendors are verified.</p>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm font-medium">Free Delivery</span>
                </div>
                <p className="text-xs text-blue-600">Estimated delivery in 3-7 business days</p>
              </div>

              {/* Promo Banner */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">Quality Assured</span>
                </div>
                <p className="text-xs text-purple-100">All products from verified agricultural vendors</p>
              </div>

              {/* Continue Shopping */}
              <Link to="/marketplace" className="flex items-center justify-center gap-2 py-3 text-emerald-600 hover:text-emerald-700 font-medium transition">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default Cart;