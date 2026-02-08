import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Tractor,
  Waves,
  Route as RouteIcon,
  Badge,
  FileText,
  Cloud,
  Loader,
  Edit3
} from 'lucide-react';
import { Layout } from './LandownerDashboard';

interface Land {
  _id: string;
  title: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  soilType: string;
  waterSource: string;
  accessibility: string;
  sizeInAcres: number;
  leasePricePerMonth: number;
  leaseDurationMonths: number;
  landPhotos: string[];
  landDocuments: string[];
  isApproved: boolean;
  rejectionReason?: string | null;
}

const EditLand: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    location: {
      address: '',
      latitude: '' as string | number,
      longitude: '' as string | number,
    },
    soilType: '',
    waterSource: '',
    accessibility: '',
    sizeInAcres: '' as string | number,
    leasePricePerMonth: '' as string | number,
    leaseDurationMonths: '' as string | number,
    newLandPhotos: null as FileList | null,
    newLandDocuments: null as FileList | null,
    existingLandPhotos: [] as string[],
    existingLandDocuments: [] as string[]
  });

  useEffect(() => {
    const fetchLandData = async () => {
      if (!id) {
        setMessage("Land ID is missing.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`https://agricorus.onrender.com/api/landowner/lands/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const land: Land = await response.json();
          setFormData({
            title: land.title,
            location: {
              address: land.location?.address || '',
              latitude: land.location?.latitude || '',
              longitude: land.location?.longitude || '',
            },
            soilType: land.soilType,
            waterSource: land.waterSource,
            accessibility: land.accessibility,
            sizeInAcres: land.sizeInAcres,
            leasePricePerMonth: land.leasePricePerMonth,
            leaseDurationMonths: land.leaseDurationMonths,
            newLandPhotos: null,
            newLandDocuments: null,
            existingLandPhotos: land.landPhotos || [],
            existingLandDocuments: land.landDocuments || []
          });
          setStatus('idle');
          setMessage('');
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || 'Failed to fetch land details for editing.');
          setStatus('error');
        }
      } catch (err) {
        setMessage('An error occurred. Please check your network.');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLandData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        location: {
          ...prevData.location,
          [field]: value,
        },
      }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, newLandPhotos: e.target.files }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, newLandDocuments: e.target.files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    const form = new FormData();
    form.append('title', formData.title);
    form.append('location.address', formData.location.address);
    form.append('location.latitude', formData.location.latitude.toString());
    form.append('location.longitude', formData.location.longitude.toString());
    form.append('soilType', formData.soilType);
    form.append('waterSource', formData.waterSource);
    form.append('accessibility', formData.accessibility);
    form.append('sizeInAcres', formData.sizeInAcres.toString());
    form.append('leasePricePerMonth', formData.leasePricePerMonth.toString());
    form.append('leaseDurationMonths', formData.leaseDurationMonths.toString());

    if (formData.newLandPhotos) {
      for (let i = 0; i < formData.newLandPhotos.length; i++) {
        form.append('landPhotos', formData.newLandPhotos[i]);
      }
    }
    if (formData.newLandDocuments) {
        for (let i = 0; i < formData.newLandDocuments.length; i++) {
          form.append('landDocuments', formData.newLandDocuments[i]);
        }
      }

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`https://agricorus.onrender.com/api/landowner/lands/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Land configuration updated successfully!');
        setTimeout(() => navigate('/lands/view'), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to update land configuration. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 font-medium text-lg">Loading land details...</p>
            <p className="text-gray-500 text-sm">Fetching configuration data</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'success' && message) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Update Successful!</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
              onClick={() => navigate('/lands/view')}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
            >
              Back to My Lands
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (status === 'error' && message) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Update Failed</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header Section with Gradient */}
        <div className="relative mb-8">
          {/* Background Gradient Banner */}
          <div className="h-48 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
          </div>

          {/* Icon Badge */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <Edit3 className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mt-16 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Edit Land Configuration</h1>
          <p className="text-gray-500 mt-2">Update your land listing with the latest details and specifications.</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Land Information</h2>
            <p className="text-gray-500 text-sm mt-1">Update complete details about your land</p>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Badge className="w-5 h-5 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Land Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Premium 5-Acre Agricultural Plot"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Tractor className="w-4 h-4 inline mr-1" />
                      Soil Type <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Alluvial, Red Soil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Waves className="w-4 h-4 inline mr-1" />
                      Water Source
                    </label>
                    <input
                      type="text"
                      name="waterSource"
                      value={formData.waterSource}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Borewell, River"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <RouteIcon className="w-4 h-4 inline mr-1" />
                      Accessibility
                    </label>
                    <input
                      type="text"
                      name="accessibility"
                      value={formData.accessibility}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., Paved Road Access"
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Address
                    </label>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter complete land address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="location.latitude"
                      value={formData.location.latitude}
                      onChange={handleChange}
                      step="any"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10.7867"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="location.longitude"
                      value={formData.location.longitude}
                      onChange={handleChange}
                      step="any"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 76.6578"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Pricing & Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                    <label className="block text-sm font-semibold text-emerald-700 mb-2">
                      Size (acres) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="sizeInAcres"
                      value={formData.sizeInAcres}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Monthly Price <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="leasePricePerMonth"
                      value={formData.leasePricePerMonth}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10000"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Duration (months) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="leaseDurationMonths"
                      value={formData.leaseDurationMonths}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="e.g., 12"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Photos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Land Photos <span className="text-gray-500 text-xs">(Max 5)</span>
                  </label>
                  
                  {formData.existingLandPhotos.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Existing Photos:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.existingLandPhotos.map((photo, index) => (
                          <img 
                            key={index}
                            src={photo} 
                            alt={`Photo ${index + 1}`} 
                            className="h-20 w-full object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all text-center">
                    <Cloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-emerald-600 font-medium hover:text-emerald-700">Upload new photos</span>
                      <input id="photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB each</p>
                  </div>
                  {formData.newLandPhotos && (
                    <p className="text-xs text-gray-600 mt-2">
                      {formData.newLandPhotos.length} new file(s) selected
                    </p>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Land Documents <span className="text-gray-500 text-xs">(Max 5)</span>
                  </label>

                  {formData.existingLandDocuments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Existing Documents:</p>
                      <div className="space-y-1">
                        {formData.existingLandDocuments.map((doc, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2">
                            <FileText className="w-3 h-3 text-blue-600" />
                            {doc.split('/').pop()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all text-center">
                    <Cloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <span className="text-emerald-600 font-medium hover:text-emerald-700">Upload new documents</span>
                      <input id="document-upload" type="file" multiple accept=".pdf" className="sr-only" onChange={handleDocumentChange} />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PDFs up to 5MB each</p>
                  </div>
                  {formData.newLandDocuments && (
                    <p className="text-xs text-gray-600 mt-2">
                      {formData.newLandDocuments.length} new file(s) selected
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Updating Land...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Update Land Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditLand;
