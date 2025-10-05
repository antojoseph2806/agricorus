import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Text,
  Image,
  CheckCircle,
  XCircle,
  Tractor,
  Calendar,
  Waves,
  Route,
  Badge,
  Globe,
  FileText,
  Upload,
  Server,
  Cloud
} from 'lucide-react';
import { Layout } from './LandownerDashboard';

interface LocationData {
  address: string;
  latitude: string;
  longitude: string;
}

interface FormData {
  title: string;
  location: LocationData;
  soilType: string;
  waterSource: string;
  accessibility: string;
  sizeInAcres: string;
  leasePricePerMonth: string;
  leaseDurationMonths: string;
  landPhotos: FileList | null;
  landDocuments: FileList | null;
}

const AddLand: React.FC = () => {
  const [landData, setLandData] = useState<FormData>({
    title: '',
    location: {
      address: '',
      latitude: '',
      longitude: '',
    },
    soilType: '',
    waterSource: '',
    accessibility: '',
    sizeInAcres: '',
    leasePricePerMonth: '',
    leaseDurationMonths: '',
    landPhotos: null,
    landDocuments: null,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const field = name.split('.')[1] as keyof LocationData;
      setLandData(prevData => ({
        ...prevData,
        location: {
          ...prevData.location,
          [field]: value,
        },
      }));
    } else {
      setLandData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 5) {
      setMessage('You can only upload a maximum of 5 photos.');
      setStatus('error');
      e.target.value = '';
      return;
    }
    setLandData({ ...landData, landPhotos: e.target.files });
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 5) {
      setMessage('You can only upload a maximum of 5 documents.');
      setStatus('error');
      e.target.value = '';
      return;
    }
    setLandData({ ...landData, landDocuments: e.target.files });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = new FormData();
    form.append('title', landData.title);
    form.append('location_address', landData.location.address);
    form.append('location_latitude', landData.location.latitude);
    form.append('location_longitude', landData.location.longitude);
    form.append('soilType', landData.soilType);
    form.append('waterSource', landData.waterSource);
    form.append('accessibility', landData.accessibility);
    form.append('sizeInAcres', landData.sizeInAcres);
    form.append('leasePricePerMonth', landData.leasePricePerMonth);
    form.append('leaseDurationMonths', landData.leaseDurationMonths);

    if (landData.landPhotos) {
      Array.from(landData.landPhotos).forEach(file => {
        form.append('landPhotos', file);
      });
    }
    if (landData.landDocuments) {
      Array.from(landData.landDocuments).forEach(file => {
        form.append('landDocuments', file);
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setMessage('Authentication failed. Please log in again.');
      return;
    }

    try {
      const response = await fetch('/api/landowner/lands', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Land listed successfully!');
        setTimeout(() => navigate('/lands/view'), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to list land. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please check your network connection.');
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl mb-6 shadow-2xl">
              <Server className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-widest mb-4 font-['Poppins']">
              List New Land
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-['Inter']">
              Deploy your land listing with our secure platform. Fill in the details below to make your land available for lease.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 p-8 transition-all duration-300 ease-in-out hover:shadow-2xl">
            {/* Status Messages */}
            {status === 'success' && (
              <div className="mb-8 p-6 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center shadow-lg">
                <CheckCircle className="w-6 h-6 mr-4 text-green-400" />
                <div>
                  <p className="text-green-200 font-semibold text-lg">Deployment Successful!</p>
                  <p className="text-green-300">{message}</p>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="mb-8 p-6 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center shadow-lg">
                <XCircle className="w-6 h-6 mr-4 text-red-400" />
                <div>
                  <p className="text-red-200 font-semibold text-lg">Deployment Failed</p>
                  <p className="text-red-300">{message}</p>
                </div>
              </div>
            )}
            {status === 'loading' && (
              <div className="mb-8 p-6 bg-blue-500/20 border border-blue-500/50 rounded-xl flex items-center shadow-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-4"></div>
                <div>
                  <p className="text-blue-200 font-semibold text-lg">Deploying Land Listing...</p>
                  <p className="text-blue-300">Please wait while we process your request</p>
                </div>
              </div>
            )}

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
                      value={landData.title}
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
                      value={landData.soilType}
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
                      value={landData.waterSource}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                      placeholder="e.g., Borewell, River, Canal"
                    />
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <label htmlFor="accessibility" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                      <Route className="w-5 h-5 inline mr-2" />
                      Accessibility
                    </label>
                    <input
                      type="text"
                      name="accessibility"
                      id="accessibility"
                      value={landData.accessibility}
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
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider font-['Poppins']">Location Details</h3>
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
                          value={landData.location.address}
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
                            value={landData.location.latitude}
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
                            value={landData.location.longitude}
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
                    value={landData.sizeInAcres}
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
                    value={landData.leasePricePerMonth}
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
                    value={landData.leaseDurationMonths}
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
                    <Image className="w-5 h-5 inline mr-2" />
                    Land Photos <span className="text-gray-400 text-xs">(Max 5 files)</span>
                  </label>
                  <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <div className="space-y-3 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#ff3b3b] transition-colors" />
                      <div className="flex text-sm text-gray-300">
                        <label htmlFor="photo-upload-input" className="relative cursor-pointer rounded-md font-medium text-[#ff3b3b] hover:text-[#ff6b6b] transition-colors">
                          <span>Upload photos</span>
                          <input id="photo-upload-input" name="landPhotos" type="file" multiple accept=".png, .jpg, .jpeg" className="sr-only" onChange={handlePhotoChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
                    </div>
                  </div>
                  {landData.landPhotos && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 mb-2">Selected files:</p>
                      <ul className="space-y-1">
                        {Array.from(landData.landPhotos).map((file, index) => (
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
                  <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group">
                    <div className="space-y-3 text-center">
                      <Cloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#ff3b3b] transition-colors" />
                      <div className="flex text-sm text-gray-300">
                        <label htmlFor="document-upload-input" className="relative cursor-pointer rounded-md font-medium text-[#ff3b3b] hover:text-[#ff6b6b] transition-colors">
                          <span>Upload documents</span>
                          <input id="document-upload-input" name="landDocuments" type="file" multiple accept=".pdf" className="sr-only" onChange={handleDocumentChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">PDFs up to 5MB each</p>
                    </div>
                  </div>
                  {landData.landDocuments && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-300 mb-2">Selected files:</p>
                      <ul className="space-y-1">
                        {Array.from(landData.landDocuments).map((file, index) => (
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
                  disabled={status === 'loading'}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-xl font-bold uppercase tracking-wider hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300 ease-in-out shadow-2xl hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      DEPLOYING LAND LISTING...
                    </span>
                  ) : (
                    'DEPLOY LAND LISTING'
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

export default AddLand;