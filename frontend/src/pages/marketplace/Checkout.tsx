import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  Wallet,
  Shield,
  Truck,
  Package,
  FileText,
  Home,
  Building,
  Star,
  AlertCircle,
  Navigation,
  ChevronRight
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
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    district: '',
    state: '',
    pincode: ''
  });
  
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // Fetch location from pincode
  const fetchLocationFromPincode = useCallback(async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) return;
    try {
      setFetchingPincode(true);
      setPincodeError(null);
      setPincodeSuccess(false);
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setDeliveryAddress(prev => ({
          ...prev,
          district: postOffice.District || '',
          state: postOffice.State || ''
        }));
        setPincodeSuccess(true);
        setErrors(prev => ({ ...prev, district: undefined, state: undefined, pincode: undefined }));
      } else {
        setPincodeError('Invalid pincode');
        setDeliveryAddress(prev => ({ ...prev, district: '', state: '' }));
      }
    } catch {
      setPincodeError('Unable to verify pincode');
      setDeliveryAddress(prev => ({ ...prev, district: '', state: '' }));
    } finally {
      setFetchingPincode(false);
    }
  }, []);

  const handlePincodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setDeliveryAddress(prev => ({ ...prev, pincode: cleanValue, district: '', state: '' }));
    setPincodeError(null);
    setPincodeSuccess(false);
    if (errors.pincode) setErrors(prev => ({ ...prev, pincode: undefined }));
    if (cleanValue.length === 6) fetchLocationFromPincode(cleanValue);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      setIsAuthenticated(!!token);
      setUserRole(role);
      
      if (!token) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }
      
      const validRoles = ['farmer', 'landowner', 'investor'];
      if (!role || !validRoles.includes(role)) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      const [cartResponse, addressResponse] = await Promise.all([
        fetch(`${backendUrl}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${backendUrl}/api/addresses`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      const cartData = await cartResponse.json();
      const addressData = await addressResponse.json();

      if (cartData.success) {
        setCart(cartData.data);
        if (!cartData.data.items.length || cartData.data.items.some((item: CartItem) => !item.isAvailable)) {
          navigate('/cart');
        }
      } else {
        navigate('/cart');
      }

      if (addressData.success) {
        setSavedAddresses(addressData.data);
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
    } catch {
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryAddress> = {};
    if (!useNewAddress) {
      if (!selectedAddressId) {
        alert('Please select a delivery address');
        return false;
      }
      return true;
    }
    if (!deliveryAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!deliveryAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(deliveryAddress.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode';
    }
    if (!deliveryAddress.district.trim()) newErrors.pincode = 'Enter valid pincode to auto-fill location';
    if (!deliveryAddress.state.trim()) newErrors.pincode = 'Enter valid pincode to auto-fill location';
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
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const validRoles = ['farmer', 'landowner', 'investor'];
    
    if (!token || !role || !validRoles.includes(role)) {
      setShowAuthModal(true);
      return;
    }
    if (!validateForm()) return;

    try {
      setPlacing(true);
      if (paymentMethod === 'COD') {
        const codResponse = await fetch(`${backendUrl}/api/marketplace/payments/cod`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliveryAddress, notes: notes.trim() || undefined })
        });
        const codData = await codResponse.json();
        if (codData.success) {
          navigate(`/orders/${codData.data._id}`, { state: { orderPlaced: true, paymentSuccess: false, paymentMethod: 'COD' } });
        } else {
          alert(codData.message || 'Failed to place order');
        }
        setPlacing(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        setPlacing(false);
        return;
      }

      const orderResponse = await fetch(`${backendUrl}/api/marketplace/payments/create-order`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const orderData = await orderResponse.json();
      if (!orderData.success) {
        alert(orderData.message || 'Failed to create payment order');
        setPlacing(false);
        return;
      }

      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'AgriCorus Marketplace',
        description: 'Agricultural Products Purchase',
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch(`${backendUrl}/api/marketplace/payments/verify`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
              navigate(`/orders/${verifyData.data._id}`, { state: { orderPlaced: true, paymentSuccess: true, paymentMethod: 'razorpay' } });
            } else {
              alert(verifyData.message || 'Payment verification failed');
            }
          } catch {
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
        theme: { color: '#059669' },
        modal: { ondismiss: () => setPlacing(false) }
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch {
      alert('Error placing order');
      setPlacing(false);
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
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
    setDeliveryAddress({ street: '', district: '', state: '', pincode: '' });
    setErrors({});
    setPincodeSuccess(false);
    setPincodeError(null);
  };

  const handleUseSavedAddress = () => {
    setUseNewAddress(false);
    setErrors({});
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) handleAddressSelection(defaultAddress._id!);
  };

  const getAddressIcon = (label: string) => {
    const l = label?.toLowerCase() || '';
    if (l.includes('home')) return <Home className="w-4 h-4" />;
    if (l.includes('office') || l.includes('work')) return <Building className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
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

  if (showAuthModal) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole)
                  ? "Invalid Account Type" : "Authentication Required"}
              </h2>
              <p className="text-gray-600 mb-6">
                {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole)
                  ? "To purchase from the marketplace, you need to be registered as a farmer, landowner, or investor."
                  : "To complete your purchase, please register or login with a valid account."}
              </p>
            </div>
            <div className="space-y-3">
              {isAuthenticated && userRole && !['farmer', 'landowner', 'investor'].includes(userRole) ? (
                <>
                  <button onClick={() => { localStorage.clear(); navigate('/register'); }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
                    Register New Account
                  </button>
                  <button onClick={() => navigate('/marketplace')}
                    className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
                    Back to Marketplace
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/register')}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
                    Register Account
                  </button>
                  <button onClick={() => navigate('/login')}
                    className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
                    Login
                  </button>
                  <button onClick={() => navigate('/marketplace')}
                    className="w-full py-3 text-gray-500 hover:text-gray-700 transition">
                    Continue Browsing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No items to checkout</h2>
            <p className="text-gray-500 mb-6">Your cart is empty or contains unavailable items.</p>
            <Link to="/cart" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/cart" className="flex items-center gap-2 text-emerald-100 hover:text-white transition">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Cart</span>
                </Link>
                <div className="w-px h-6 bg-emerald-400/50" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Checkout</h1>
                    <p className="text-emerald-100 text-sm">{cart.totalItems} items • ₹{cart.subtotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {/* Progress Steps */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 text-emerald-200"><Package className="w-4 h-4" /> Cart</span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
                <span className="flex items-center gap-1 text-white font-medium"><CreditCard className="w-4 h-4" /> Checkout</span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
                <span className="flex items-center gap-1 text-emerald-200"><CheckCircle className="w-4 h-4" /> Done</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-5">
              {/* Delivery Address Section */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800">Delivery Address</h2>
                  </div>
                  <Link to="/addresses" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Manage
                  </Link>
                </div>
                <div className="p-5">
                  {savedAddresses.length > 0 && (
                    <div className="flex gap-3 mb-4">
                      <button onClick={handleUseSavedAddress}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${!useNewAddress ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        Saved Address
                      </button>
                      <button onClick={handleUseNewAddress}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition ${useNewAddress ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        New Address
                      </button>
                    </div>
                  )}

                  {/* Saved Addresses */}
                  {!useNewAddress && savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      {savedAddresses.map((address) => (
                        <div key={address._id} onClick={() => handleAddressSelection(address._id!)}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddressId === address._id ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 hover:border-emerald-200'
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedAddressId === address._id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {getAddressIcon(address.label!)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-800">{address.label}</span>
                                {address.isDefault && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{address.street}</p>
                              <p className="text-sm text-gray-500">{address.district}, {address.state} - {address.pincode}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAddressId === address._id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                            }`}>
                              {selectedAddressId === address._id && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Address Form */}
                  {(useNewAddress || savedAddresses.length === 0) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                        <input type="text" value={deliveryAddress.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${errors.street ? 'border-red-300' : 'border-gray-200'}`}
                          placeholder="House/Flat No., Building, Street, Landmark" />
                        {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input type="text" value={deliveryAddress.pincode} onChange={(e) => handlePincodeChange(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-12 ${
                              errors.pincode || pincodeError ? 'border-red-300' : pincodeSuccess ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'
                            }`}
                            placeholder="6-digit pincode" maxLength={6} />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {fetchingPincode && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
                            {!fetchingPincode && pincodeSuccess && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            {!fetchingPincode && pincodeError && <AlertCircle className="w-5 h-5 text-red-500" />}
                          </div>
                        </div>
                        {(errors.pincode || pincodeError) && <p className="mt-1 text-sm text-red-600">{errors.pincode || pincodeError}</p>}
                        {pincodeSuccess && <p className="mt-1 text-sm text-emerald-600 flex items-center gap-1"><Navigation className="w-3 h-3" /> Location verified</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">District <span className="text-emerald-600 text-xs">(Auto)</span></label>
                          <div className={`px-4 py-3 rounded-xl ${deliveryAddress.district ? 'bg-emerald-50 border border-emerald-200 text-gray-800' : 'bg-gray-100 border border-gray-200 text-gray-400'}`}>
                            {deliveryAddress.district || 'Enter pincode'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">State <span className="text-emerald-600 text-xs">(Auto)</span></label>
                          <div className={`px-4 py-3 rounded-xl ${deliveryAddress.state ? 'bg-emerald-50 border border-emerald-200 text-gray-800' : 'bg-gray-100 border border-gray-200 text-gray-400'}`}>
                            {deliveryAddress.state || 'Enter pincode'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-gray-800">Order Notes</h2>
                  <span className="text-xs text-gray-400">(Optional)</span>
                </div>
                <div className="p-5">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
                    rows={2} placeholder="Any special instructions for your order..." maxLength={500} />
                  <p className="mt-1 text-xs text-gray-400 text-right">{notes.length}/500</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="font-semibold text-gray-800">Payment Method</h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod('COD')}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'COD' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 hover:border-emerald-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <Wallet className={`w-4 h-4 ${paymentMethod === 'COD' ? 'text-emerald-600' : 'text-gray-500'}`} />
                      </div>
                      <span className="font-medium text-gray-800">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-11">Pay when delivered</p>
                    {paymentMethod === 'COD' && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                  <button onClick={() => setPaymentMethod('razorpay')}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === 'razorpay' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 hover:border-emerald-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'razorpay' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <CreditCard className={`w-4 h-4 ${paymentMethod === 'razorpay' ? 'text-emerald-600' : 'text-gray-500'}`} />
                      </div>
                      <span className="font-medium text-gray-800">Pay Online</span>
                    </div>
                    <p className="text-xs text-gray-500 ml-11">UPI, Cards, Net Banking</p>
                    {paymentMethod === 'razorpay' && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-5">
              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="font-semibold text-gray-800">Order Summary</h2>
                </div>
                <div className="p-5">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.productId} className="flex gap-3">
                        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img src={item.image || '/placeholder-product.jpg'}
                            alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.productName}</h3>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">₹{item.subtotal.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({cart.totalItems} items)</span>
                      <span className="text-gray-800">₹{cart.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-emerald-600">₹{cart.subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button onClick={placeOrder} disabled={placing || (useNewAddress && !pincodeSuccess && savedAddresses.length === 0) || (useNewAddress && !pincodeSuccess)}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                {placing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> {paymentMethod === 'COD' ? 'Place COD Order' : 'Proceed to Payment'}</>
                )}
              </button>

              {/* Trust Badges */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure Checkout</span>
                </div>
                <p className="text-xs text-emerald-600">Your order is processed securely. All vendors are verified.</p>
              </div>

              {/* Delivery Info */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Free Delivery</p>
                  <p className="text-xs text-blue-600">Estimated delivery in 3-7 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default Checkout;