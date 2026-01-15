import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  RefreshCw,
  Home,
  Building,
  Star,
  Loader2,
  AlertCircle,
  X,
  MapPinned,
  Navigation,
  Shield,
  Package
} from 'lucide-react';
import MarketplaceLayout from '../../components/MarketplaceLayout';

interface Address {
  _id: string;
  label: string;
  street: string;
  district: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
}

const ManageAddresses: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    district: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);

  // Fetch location details from pincode using India Post API
  const fetchLocationFromPincode = useCallback(async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) {
      return;
    }

    try {
      setFetchingPincode(true);
      setPincodeError(null);
      setPincodeSuccess(false);

      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          district: postOffice.District || '',
          state: postOffice.State || ''
        }));
        setPincodeSuccess(true);
        setErrors(prev => ({ ...prev, district: '', state: '', pincode: '' }));
      } else {
        setPincodeError('Invalid pincode. Please check and try again.');
        setFormData(prev => ({ ...prev, district: '', state: '' }));
      }
    } catch (error) {
      console.error('Error fetching pincode details:', error);
      setPincodeError('Unable to verify pincode. Please try again.');
      setFormData(prev => ({ ...prev, district: '', state: '' }));
    } finally {
      setFetchingPincode(false);
    }
  }, []);

  // Handle pincode change with auto-fetch
  const handlePincodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: cleanValue, district: '', state: '' }));
    setPincodeError(null);
    setPincodeSuccess(false);
    
    if (errors.pincode) {
      setErrors(prev => ({ ...prev, pincode: '' }));
    }

    if (cleanValue.length === 6) {
      fetchLocationFromPincode(cleanValue);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${backendUrl}/api/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Address label is required';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode';
    }
    if (!formData.district.trim()) {
      newErrors.pincode = 'Enter valid pincode to auto-fill district';
    }
    if (!formData.state.trim()) {
      newErrors.pincode = 'Enter valid pincode to auto-fill state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const url = editingAddress 
        ? `${backendUrl}/api/addresses/${editingAddress._id}`
        : `${backendUrl}/api/addresses`;
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
        resetForm();
        setShowForm(false);
        setEditingAddress(null);
      } else {
        alert(data.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      street: address.street,
      district: address.district,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingAddress(address);
    setPincodeSuccess(true); // Show as verified since it's existing data
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setDeleting(addressId);
      const token = localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
      } else {
        alert(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/addresses/${addressId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const resetForm = () => {
    setFormData({ label: '', street: '', district: '', state: '', pincode: '', isDefault: false });
    setErrors({});
    setPincodeError(null);
    setPincodeSuccess(false);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setEditingAddress(null);
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return <Home className="w-5 h-5" />;
    if (l.includes('office') || l.includes('work')) return <Building className="w-5 h-5" />;
    return <MapPin className="w-5 h-5" />;
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <MarketplaceLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPinned className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Delivery Addresses</h1>
                <p className="text-emerald-100 mt-1">Manage your shipping addresses for faster checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/marketplace"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Address
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Addresses</p>
              <p className="font-bold text-gray-800">{addresses.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Default Address</p>
              <p className="font-bold text-gray-800">{addresses.find(a => a.isDefault)?.label || 'Not set'}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Secure Delivery</p>
              <p className="font-bold text-gray-800">Verified Locations</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Label & Pincode Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, label: e.target.value }));
                        if (errors.label) setErrors(prev => ({ ...prev, label: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
                        errors.label ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="e.g., Home, Office"
                    />
                    {errors.label && <p className="mt-1 text-sm text-red-600">{errors.label}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-12 ${
                          errors.pincode || pincodeError ? 'border-red-300' : pincodeSuccess ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'
                        }`}
                        placeholder="6-digit pincode"
                        maxLength={6}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {fetchingPincode && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
                        {!fetchingPincode && pincodeSuccess && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                        {!fetchingPincode && pincodeError && <AlertCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    </div>
                    {(errors.pincode || pincodeError) && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode || pincodeError}</p>
                    )}
                    {pincodeSuccess && (
                      <p className="mt-1 text-sm text-emerald-600 flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> Location verified
                      </p>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, street: e.target.value }));
                      if (errors.street) setErrors(prev => ({ ...prev, street: '' }));
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
                      errors.street ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="House/Flat No., Building, Street, Landmark"
                  />
                  {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                </div>

                {/* District & State (Read-only, auto-filled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      District <span className="text-emerald-600 text-xs">(Auto-filled)</span>
                    </label>
                    <div className={`w-full px-4 py-3 rounded-xl ${
                      formData.district 
                        ? 'bg-emerald-50 border border-emerald-200 text-gray-800' 
                        : 'bg-gray-100 border border-gray-200 text-gray-400'
                    }`}>
                      {formData.district || 'Enter pincode first'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State <span className="text-emerald-600 text-xs">(Auto-filled)</span>
                    </label>
                    <div className={`w-full px-4 py-3 rounded-xl ${
                      formData.state 
                        ? 'bg-emerald-50 border border-emerald-200 text-gray-800' 
                        : 'bg-gray-100 border border-gray-200 text-gray-400'
                    }`}>
                      {formData.state || 'Enter pincode first'}
                    </div>
                  </div>
                </div>

                {/* Default Checkbox */}
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Set as default address</p>
                    <p className="text-sm text-gray-500">Use this for all deliveries</p>
                  </div>
                </label>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !pincodeSuccess}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {editingAddress ? 'Update' : 'Save Address'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Addresses Saved</h3>
            <p className="text-gray-500 mb-6">Add your first delivery address for faster checkout</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white rounded-2xl border-2 p-5 hover:shadow-lg transition-all ${
                  address.isDefault ? 'border-emerald-500' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      address.isDefault ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getAddressIcon(address.label)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{address.label}</h3>
                      {address.isDefault && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <Star className="w-3 h-3 fill-current" /> Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>{address.street}</p>
                  <p className="font-medium text-gray-700">
                    {address.district}, {address.state} - {address.pincode}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition text-sm font-medium"
                    >
                      <Star className="w-4 h-4" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    disabled={deleting === address._id}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium disabled:opacity-50"
                  >
                    {deleting === address._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
          <Package className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-800">Fast & Secure Delivery</p>
            <p className="text-sm text-emerald-600">
              All deliveries are handled by verified logistics partners. Your address information is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default ManageAddresses;
