import React, { useState, useEffect } from 'react';
import { Layout } from './Layout';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Users,
  Calendar,
  Building,
  Mail,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface VerifiedVendor {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  establishedYear?: number;
  verifiedAt: string;
  address: {
    street: string;
    district: string;
    state: string;
    pincode: string;
  };
  vendorId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };
}

const VerifiedVendors: React.FC = () => {
  const [vendors, setVendors] = useState<VerifiedVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState<VerifiedVendor | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchVerifiedVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(businessTypeFilter !== 'ALL' && { businessType: businessTypeFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/admin/kyc/verified-vendors?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setVendors(data.data.vendors);
        setTotalPages(data.data.pagination.total);
        setTotalVendors(data.data.pagination.totalRecords);
      }
    } catch (error) {
      console.error('Error fetching verified vendors:', error);
    }
  };

  const openModal = (vendor: VerifiedVendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchVerifiedVendors();
      setLoading(false);
    };
    loadData();
  }, [currentPage, businessTypeFilter, searchTerm]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Verified Vendors</h1>
            <p className="text-sm sm:text-base text-gray-600">View all verified vendors on the platform</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Card */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Verified Vendors</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{totalVendors}</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by business name, owner name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
              >
                <option value="ALL">All Business Types</option>
                <option value="Individual">Individual</option>
                <option value="Partnership">Partnership</option>
                <option value="PvtLtd">Private Limited</option>
                <option value="LLP">LLP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Table/Cards */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          {/* Mobile Card View */}
          <div className="block lg:hidden divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <div key={vendor._id} className="p-4 hover:bg-gray-50">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{vendor.ownerName}</div>
                      <div className="text-xs text-gray-500 truncate">{vendor.email}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Business Name</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{vendor.businessName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm text-gray-900">{vendor.businessType}</p>
                      </div>
                      {vendor.establishedYear && (
                        <div>
                          <p className="text-xs text-gray-500">Est.</p>
                          <p className="text-sm text-gray-900">{vendor.establishedYear}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{vendor.address.district}, {vendor.address.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Verified</p>
                      <p className="text-sm text-gray-900">{new Date(vendor.verifiedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openModal(vendor)}
                    className="w-full flex items-center justify-center gap-1 text-emerald-600 hover:text-emerald-900 text-sm font-medium py-2 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vendor.ownerName}</div>
                          <div className="text-sm text-gray-500">{vendor.email}</div>
                          <div className="text-sm text-gray-500">{vendor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                        <div className="text-sm text-gray-500">{vendor.businessType}</div>
                        {vendor.establishedYear && (
                          <div className="text-sm text-gray-500">Est. {vendor.establishedYear}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.address.district}</div>
                      <div className="text-sm text-gray-500">{vendor.address.state}</div>
                      <div className="text-sm text-gray-500">{vendor.address.pincode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vendor.verifiedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(vendor)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-900"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * 10, totalVendors)}</span> of{' '}
                    <span className="font-medium">{totalVendors}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Vendor Details */}
        {showModal && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Verified Vendor Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Business Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                      Business Information
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Business Name</label>
                        <p className="text-sm text-gray-900 break-words">{selectedVendor.businessName}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Business Type</label>
                        <p className="text-sm text-gray-900">{selectedVendor.businessType}</p>
                      </div>
                      {selectedVendor.establishedYear && (
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-gray-500">Established Year</label>
                          <p className="text-sm text-gray-900">{selectedVendor.establishedYear}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Owner Name</label>
                        <p className="text-sm text-gray-900">{selectedVendor.ownerName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      Contact Information
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm text-gray-900 break-all">{selectedVendor.email}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{selectedVendor.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      Address Information
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Street Address</label>
                        <p className="text-sm text-gray-900 break-words">{selectedVendor.address.street}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">District</label>
                        <p className="text-sm text-gray-900">{selectedVendor.address.district}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">State</label>
                        <p className="text-sm text-gray-900">{selectedVendor.address.state}</p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Pincode</label>
                        <p className="text-sm text-gray-900">{selectedVendor.address.pincode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Information */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      Verification Information
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Verified Date</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedVendor.verifiedAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500">Account Created</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedVendor.vendorId.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VerifiedVendors;