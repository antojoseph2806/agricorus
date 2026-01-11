import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  RefreshCw,
  Home,
  Building,
  Star
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
      } else {
        console.error('Failed to fetch addresses:', data.message);
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
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

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
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

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
      alert('Error deleting address');
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
      } else {
        alert(data.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Error setting default address');
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      district: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'office':
      case 'work':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    fetchAddresses();
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
                Back to Marketplace
              </Link>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h1 className="text-2xl font-bold text-gray-900">Manage Addresses</h1>
              </div>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.label ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Home, Office, Farm"
                  />
                  {errors.label && (
                    <p className="mt-1 text-sm text-red-600">{errors.label}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    errors.street ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your complete street address"
                />
                {errors.street && (
                  <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
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
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your delivery addresses for faster checkout
            </p>
          </div>

          {addresses.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-4">
                Add your first delivery address to make checkout faster
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {addresses.map((address) => (
                <div key={address._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-emerald-600">
                          {getAddressIcon(address.label)}
                        </div>
                        <h3 className="font-medium text-gray-900">{address.label}</h3>
                        {address.isDefault && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            Default
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>{address.district}, {address.state} - {address.pincode}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address._id)}
                          className="p-2 text-gray-400 hover:text-emerald-600 transition"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Edit address"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(address._id)}
                        disabled={deleting === address._id}
                        className="p-2 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed transition"
                        title="Delete address"
                      >
                        {deleting === address._id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MarketplaceLayout>
  );
};

export default ManageAddresses;