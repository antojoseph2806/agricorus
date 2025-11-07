import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Text,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Tractor,
  Calendar,
  Waves,
  Route as RouteIcon,
  Badge,
  Globe,
  Loader2,
  FileText,
  Upload,
  Cloud,
  Server,
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
        <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] flex items-center justify-center">
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ff3b3b] mx-auto mb-4"></div>
            <h3 className="text-white font-bold text-xl uppercase tracking-wider mb-2">Loading Configuration</h3>
            <p className="text-gray-300">Fetching land details for editing...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'success' && message) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10 text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-2xl uppercase tracking-wider mb-2 font-['Poppins']">Update Successful!</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <button 
              onClick={() => navigate('/lands/view')}
              className="w-full py-3 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-lg font-bold uppercase tracking-wider hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (status === 'error' && message) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/10 text-center max-w-md">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-2xl uppercase tracking-wider mb-2 font-['Poppins']">Update Failed</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-lg font-bold uppercase tracking-wider hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300"
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl mb-6 shadow-2xl">
              <Edit3 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-widest mb-4 font-['Poppins']">
              Edit Land Configuration
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-['Inter']">
              Update your land listing configuration with the latest details and specifications.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 p-8 transition-all duration-300 ease-in-out hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                      <Badge className="w-5 h-5 inline mr-2" />
                      Land Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                      placeholder="e.g., Premium 5-Acre Agricultural Plot"
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <label htmlFor="soilType" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                      <Tractor className="w-5 h-5 inline mr-2" />
                      Soil Type <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="soilType"
                      id="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                      placeholder="e.g., Alluvial, Red Soil, Black Cotton"
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <label htmlFor="waterSource" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                      <Waves className="w-5 h-5 inline mr-2" />
                      Water Source
                    </label>
                    <input
                      type="text"
                      name="waterSource"
                      id="waterSource"
                      value={formData.waterSource}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                      placeholder="e.g., Borewell, River, Canal"
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <label htmlFor="accessibility" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                      <RouteIcon className="w-5 h-5 inline mr-2" />
                      Accessibility
                    </label>
                    <input
                      type="text"
                      name="accessibility"
                      id="accessibility"
                      value={formData.accessibility}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                      placeholder="e.g., Paved Road Access, Highway Nearby"
                    />
                  </div>
                </div>

                {/* Right Column - Location Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <MapPin className="w-6 h-6 text-[#ff3b3b] mr-3" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider font-['Poppins']">Location Configuration</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="location.address" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                        Full Address
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="location.address"
                          id="location.address"
                          value={formData.location.address}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300 pl-12"
                          placeholder="Enter complete land address"
                        />
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="location.latitude" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                          Latitude
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="location.latitude"
                            id="location.latitude"
                            value={formData.location.latitude}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300 pl-12"
                            placeholder="e.g., 10.7867"
                            step="any"
                          />
                          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="location.longitude" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                          Longitude
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="location.longitude"
                            id="location.longitude"
                            value={formData.location.longitude}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300 pl-12"
                            placeholder="e.g., 76.6578"
                            step="any"
                          />
                          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                  <label htmlFor="sizeInAcres" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                    <Text className="w-5 h-5 inline mr-2" />
                    Size (acres) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="sizeInAcres"
                    id="sizeInAcres"
                    value={formData.sizeInAcres}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                    placeholder="e.g., 5"
                  />
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                  <label htmlFor="leasePricePerMonth" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                    <DollarSign className="w-5 h-5 inline mr-2" />
                    Monthly Price <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="leasePricePerMonth"
                    id="leasePricePerMonth"
                    value={formData.leasePricePerMonth}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                    placeholder="e.g., 10000"
                  />
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                  <label htmlFor="leaseDurationMonths" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Duration (months) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="leaseDurationMonths"
                    id="leaseDurationMonths"
                    value={formData.leaseDurationMonths}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              {/* File Upload Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Photos Upload */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">
                    <ImageIcon className="w-5 h-5 inline mr-2" />
                    Land Photos <span className="text-gray-400 text-xs">(Max 5 files)</span>
                  </label>
                  
                  {formData.existingLandPhotos.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Existing Photos</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.existingLandPhotos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={photo} 
                              alt={`Existing photo ${index + 1}`} 
                              className="h-20 w-full object-cover rounded-lg border border-white/10 group-hover:border-[#ff3b3b]/50 transition-colors duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">Photo {index + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <div className="space-y-3 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#ff3b3b] transition-colors" />
                      <div className="flex text-sm text-gray-300">
                        <label htmlFor="photo-upload" className="relative cursor-pointer rounded-md font-medium text-[#ff3b3b] hover:text-[#ff6b6b] transition-colors">
                          <span>Upload new photos</span>
                          <input id="photo-upload" name="landPhotos" type="file" multiple className="sr-only" onChange={handlePhotoChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
                    </div>
                  </div>
                  {formData.newLandPhotos && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 mb-2">New files selected:</p>
                      <ul className="space-y-1">
                        {Array.from(formData.newLandPhotos).map((file, index) => (
                          <li key={index} className="text-xs text-gray-400 bg-white/5 rounded px-3 py-1">
                            📷 {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Documents Upload */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <label className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">
                    <FileText className="w-5 h-5 inline mr-2" />
                    Land Documents <span className="text-gray-400 text-xs">(Max 5 files)</span>
                  </label>

                  {formData.existingLandDocuments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Existing Documents</h3>
                      <ul className="space-y-2">
                        {formData.existingLandDocuments.map((doc, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-300 bg-white/5 rounded-lg px-3 py-2">
                            <FileText className="w-4 h-4 mr-3 flex-shrink-0 text-[#ff3b3b]" />
                            <span className="truncate">{doc.split('/').pop()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <div className="space-y-3 text-center">
                      <Cloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#ff3b3b] transition-colors" />
                      <div className="flex text-sm text-gray-300">
                        <label htmlFor="document-upload" className="relative cursor-pointer rounded-md font-medium text-[#ff3b3b] hover:text-[#ff6b6b] transition-colors">
                          <span>Upload new documents</span>
                          <input id="document-upload" name="landDocuments" type="file" multiple className="sr-only" onChange={handleDocumentChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">PDFs up to 5MB each</p>
                    </div>
                  </div>
                  {formData.newLandDocuments && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 mb-2">New files selected:</p>
                      <ul className="space-y-1">
                        {Array.from(formData.newLandDocuments).map((file, index) => (
                          <li key={index} className="text-xs text-gray-400 bg-white/5 rounded px-3 py-1">
                            📄 {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-xl font-bold uppercase tracking-wider hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300 ease-in-out shadow-2xl hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      UPDATING CONFIGURATION...
                    </span>
                  ) : (
                    'UPDATE LAND CONFIGURATION'
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