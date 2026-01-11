import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  RefreshCw,
  Wallet
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

interface DeliveryAddress {
  _id?: string;
  label?: string;
  street: string;
  district: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'razorpay'>('COD');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    district: '',
    state: '',
    pincode: ''
  });
  
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      // Check authentication and role
      setIsAuthenticated(!!token);
      setUserRole(role);
      
      // Check if user is authenticated and has valid role for marketplace
      if (!token) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }
      
      // Check if user has valid role (farmer, landowner, investor)
      const validRoles = ['farmer', 'landowner', 'investor'];
      if (!role || !validRoles.includes(role)) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      // Fetch cart and addresses in parallel
      const [cartResponse, addressResponse] = await Promise.all([
        fetch(`${backendUrl}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${backendUrl}/api/addresses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const cartData = await cartResponse.json();
      const addressData = await addressResponse.json();

      if (cartData.success) {
        setCart(cartData.data);
        
        // Redirect if cart is empty or has unavailable items
        if (!cartData.data.items.length || cartData.data.items.some((item: CartItem) => !item.isAvailable)) {
          navigate('/cart');
        }
      } else {
        console.error('Failed to fetch cart:', cartData.message);
        navigate('/cart');
      }

      if (addressData.success) {
        setSavedAddresses(addressData.data);
        
        // Auto-select default address if available
        const defaultAddress = addressData.data.find((addr: DeliveryAddress) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id!);
          setDeliveryAddress({
            street: defaultAddress.street,
            district: defaultAddress.district,
            state: defaultAddress.state,
            pincode: defaultAddress.pincode
          });
        } else if (addressData.data.length === 0) {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryAddress> = {};

    // If using saved address, validate selection
    if (!useNewAddress) {
      if (!selectedAddressId) {
        alert('Please select a delivery address');
        return false;
      }
      return true;
    }

    // If using new address, validate form fields
    if (!deliveryAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!deliveryAddress.district.trim()) {
      newErrors.district = 'District is required';
    }
    if (!deliveryAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!deliveryAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async () => {
    // Check authentication before placing order
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const validRoles = ['farmer', 'landowner', 'investor'];
    
    if (!token || !role || !validRoles.includes(role)) {
      setShowAuthModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setPlacing(true);

      // COD flow
      if (paymentMethod === 'COD') {
        const codResponse = await fetch(`${backendUrl}/api/marketplace/payments/cod`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            deliveryAddress,
            notes: notes.trim() || undefined
          })
        });

        const codData = await codResponse.json();
        if (codData.success) {
          navigate(`/orders/${codData.data._id}`, { 
            state: { orderPlaced: true, paymentSuccess: false, paymentMethod: 'COD' } 
          });
        } else {
          alert(codData.message || 'Failed to place order');
        }
        setPlacing(false);
        return;
      }
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setPlacing(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await fetch(`${backendUrl}/api/marketplace/payments/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        alert(orderData.message || 'Failed to create payment order');
        setPlacing(false);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'AgriCorus Marketplace',
        description: 'Agricultural Products Purchase',
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${backendUrl}/api/marketplace/payments/verify`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                deliveryAddress,
                notes: notes.trim() || undefined
              })
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              navigate(`/orders/${verifyData.data._id}`, { 
                state: { orderPlaced: true, paymentSuccess: true, paymentMethod: 'razorpay' } 
              });
            } else {
              alert(verifyData.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: function() {
            setPlacing(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
      setPlacing(false);
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr._id === addressId);
    if (selectedAddress) {
      setDeliveryAddress({
        street: selectedAddress.street,
        district: selectedAddress.district,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode
      });
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setDeliveryAddress({
      street: '',
      district: '',
      state: '',
      pincode: ''
    });
    setErrors({});
  };

  const handleUseSavedAddress = () => {
    setUseNewAddress(false);
    setErrors({});
    
    // Auto-select default address if available
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      handleAddressSelection(defaultAddress._id!);
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'home':
        return '🏠';
      case 'office':
      case 'work':
        return '🏢';
      case 'farm':
        return '🌾';
      default:
        return '📍';
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

  // Show authentication modal if user is not authenticated or doesn't have valid role
  if (showAuthModal) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg border p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                <ShoppingCart className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole)
                  ? "Invalid Account Type" 
                  : "Authentication Required"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole)
                  ? "To purchase from the marketplace, you need to be registered as a farmer, landowner, or investor."
                  : "To complete your purchase, you need to register as a farmer, landowner, or investor and login."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole) ? (
                <>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('role');
                      navigate('/register');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Register New Account
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Back to Marketplace
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Register Account
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-500 hover:text-gray-700 transition"
                  >
                    Continue Browsing
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole)
                ? `You're currently logged in as a ${userRole}. Please register a new account with the appropriate role.`
                : "Already have an account? Click 'Login' to access your dashboard."}
            </p>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No items to checkout</h2>
            <p className="text-gray-600 mb-4">Your cart is empty or contains unavailable items.</p>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
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
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                </div>
                <Link
                  to="/addresses"
                  className="text-sm text-emerald-600 hover:text-emerald-700 transition"
                >
                  Manage Addresses
                </Link>
              </div>

              {/* Address Selection Options */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={handleUseSavedAddress}
                      className={`px-4 py-2 rounded-lg border transition ${
                        !useNewAddress
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-emerald-200'
                      }`}
                    >
                      Use Saved Address
                    </button>
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className={`px-4 py-2 rounded-lg border transition ${
                        useNewAddress
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-700 hover:border-emerald-200'
                      }`}
                    >
                      Use New Address
                    </button>
                  </div>

                  {/* Saved Addresses List */}
                  {!useNewAddress && (
                    <div className="space-y-3 mb-4">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          className={`border rounded-lg p-4 cursor-pointer transition ${
                            selectedAddressId === address._id
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-200'
                          }`}
                          onClick={() => handleAddressSelection(address._id!)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getAddressIcon(address.label!)}</span>
                                <span className="font-medium text-gray-900">{address.label}</span>
                                {address.isDefault && (
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{address.street}</p>
                                <p>{address.district}, {address.state} - {address.pincode}</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 transition ${
                              selectedAddressId === address._id
                                ? 'border-emerald-600 bg-emerald-600'
                                : 'border-gray-300'
                            }`}>
                              {selectedAddressId === address._id && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* New Address Form */}
              {(useNewAddress || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.street ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your complete street address"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.district}
                      onChange={(e) => handleAddressChange('district', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.district ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="District"
                    />
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.state ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                        errors.pincode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                placeholder="Any special instructions for your order..."
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {notes.length}/500 characters
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`w-full text-left border rounded-lg p-4 transition ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      paymentMethod === 'COD' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Selected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Pay when your order is delivered.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full text-left border rounded-lg p-4 transition ${
                    paymentMethod === 'razorpay'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-gray-900">Online Payment (Razorpay)</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      paymentMethod === 'razorpay' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Selected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Pay securely using UPI, Cards, Net Banking, or Wallets.</p>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <img
                        src={item.image ? `${backendUrl}${item.image}` : '/placeholder-product.jpg'}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs">{getCategoryIcon(item.category)}</span>
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {item.productName}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{item.subtotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="text-gray-900">₹{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span className="text-gray-900">Total</span>
                  <span className="text-emerald-600">₹{cart.subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Place Order */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {placing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {paymentMethod === 'COD' ? 'Place COD Order' : 'Proceed to Payment'}
                  </>
                )}
              </button>
              
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure Checkout</span>
                </div>
                <p className="text-xs text-gray-600">
                  Your order will be processed securely. All vendors are verified.
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Payment Information</span>
              </div>
              <p className="text-sm text-blue-700">
                Choose Cash on Delivery or pay online via Razorpay (UPI, Cards, Net Banking, Wallets).
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default Checkout;