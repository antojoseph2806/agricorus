import React, { useState, useCallback } from 'react';
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
  Cloud,
  Search,
  Loader,
  LocateFixed, // New icon for current location
} from 'lucide-react';

import { Layout } from './LandownerDashboard';

// --- Interface Definitions (Same as before) ---
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
// ---------------------------------------------

// *** MOCK GEOLOCATION SERVICE FUNCTION (for Address Search) ***
// ⚠️ Replace this with your actual API call for address geocoding.
const mockGeocodeAddress = async (address: string): Promise<{ lat: string, lng: string } | null> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerAddress = address.toLowerCase();

  if (lowerAddress.includes('mumbai')) {
    return { lat: '19.0760', lng: '72.8777' };
  }
  if (lowerAddress.includes('delhi')) {
    return { lat: '28.7041', lng: '77.1025' };
  }
  if (lowerAddress.includes('fail')) {
    return null; 
  }

  const mockLat = (Math.random() * (30 - 10) + 10).toFixed(4);
  const mockLng = (Math.random() * (90 - 70) + 70).toFixed(4);

  return { lat: mockLat, lng: mockLng };
};
// *****************************************

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
  const [geoSearchStatus, setGeoSearchStatus] = useState<'idle' | 'searching' | 'locating'>('idle'); // Added 'locating' state
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Unified change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (status !== 'idle') setStatus('idle');
    if (message) setMessage('');

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

  // Handler for ADDRESS search and autofill (using mock API)
  const handleAddressSearch = useCallback(async () => {
    const address = landData.location.address.trim();
    if (!address) {
      setMessage('Please enter a full address to search.');
      setStatus('error');
      return;
    }

    setGeoSearchStatus('searching');
    setStatus('idle');
    setMessage('Searching for coordinates...');

    try {
      const result = await mockGeocodeAddress(address);

      if (result) {
        setLandData(prevData => ({
          ...prevData,
          location: {
            ...prevData.location,
            latitude: result.lat,
            longitude: result.lng,
          },
        }));
        setMessage('Coordinates found and autofilled successfully! 🎉');
        setStatus('success');
      } else {
        setMessage('Could not find precise coordinates. Refine the address or enter coordinates manually.');
        setStatus('error');
      }
    } catch (err) {
      setMessage('Geolocation service error. Please try again.');
      setStatus('error');
      console.error('Geolocation Error:', err);
    } finally {
      setGeoSearchStatus('idle');
    }
  }, [landData.location.address]);


  // Handler for FETCHING CURRENT BROWSER LOCATION
  const handleCurrentLocationFetch = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    setGeoSearchStatus('locating');
    setStatus('idle');
    setMessage('Fetching current location via GPS...');

    // Use browser's native Geolocation API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setLandData(prevData => ({
          ...prevData,
          location: {
            // Note: Address remains blank/manual unless you reverse-geocode the result
            ...prevData.location, 
            latitude: lat,
            longitude: lng,
          },
        }));
        
        setGeoSearchStatus('idle');
        setMessage(`Current GPS location fetched: Lat ${lat}, Lng ${lng}. Address may need manual input.`);
        setStatus('success');
      },
      (error) => {
        setGeoSearchStatus('idle');
        setMessage(`Error fetching location: ${error.message}. Check permissions and try again.`);
        setStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);


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

    if (!landData.location.address || !landData.location.latitude || !landData.location.longitude) {
      setStatus('error');
      setMessage('Location details are incomplete. Please ensure both address and coordinates are provided.');
      return;
    }

    // ... (rest of the submission logic remains the same)
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
      const response = await fetch('https://agricorus.onrender.com/api/landowner/lands', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Land listed successfully! Redirecting you to view listings.');
        setTimeout(() => navigate('/lands/view'), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to list land. Server responded with an error.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('A network error occurred. Check your connection or server status.');
      console.error('Submission Error:', err);
    }
  };


  const isSearching = geoSearchStatus === 'searching';
  const isLocating = geoSearchStatus === 'locating';
  const isSubmitting = status === 'loading';

  return (
    <Layout> 
      <div className="min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section (omitted) */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-2xl mb-6 shadow-2xl">
              <Server className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white uppercase tracking-widest mb-4 font-['Poppins']">
              List New Land
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-['Inter']">
              Deploy your land listing with our secure platform. Fill in the details below.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-gradient-to-br from-[#1a2a88]/80 to-[#2d1a88]/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 p-8 transition-all duration-300 ease-in-out hover:shadow-2xl">
            {/* Status Messages */}
            {(status === 'success' || status === 'error' || isLocating || isSearching) && (
              <div className={`mb-8 p-6 rounded-xl flex items-center shadow-lg 
                ${status === 'success' ? 'bg-green-500/20 border border-green-500/50' : 
                  (status === 'error' ? 'bg-red-500/20 border border-red-500/50' : 
                  'bg-blue-500/20 border border-blue-500/50')
                }`}>
                {isLocating || isSearching ? 
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-4"></div> : 
                  (status === 'success' ? <CheckCircle className="w-6 h-6 mr-4 text-green-400" /> : <XCircle className="w-6 h-6 mr-4 text-red-400" />)
                }
                <div>
                  <p className={`font-semibold text-lg ${status === 'success' ? 'text-green-200' : (status === 'error' ? 'text-red-200' : 'text-blue-200')}`}>
                    {isLocating ? 'Fetching Current Location...' : (isSearching ? 'Searching Coordinates by Address...' : (status === 'success' ? 'Operation Successful!' : 'Operation Failed'))}
                  </p>
                  <p className={status === 'success' ? 'text-green-300' : (status === 'error' ? 'text-red-300' : 'text-blue-300')}>
                    {message}
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column (Non-Location Fields - Omitted for brevity, they are unchanged) */}
                <div className="space-y-6">
                  {/* ... Land Title, Soil Type, Water Source, Accessibility fields ... */}
                  {/* Land Title */}
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

                  {/* Soil Type */}
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

                  {/* Water Source */}
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

                  {/* Accessibility */}
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


                {/* Right Column - Location Section (ENHANCED) */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <MapPin className="w-6 h-6 text-[#ff3b3b] mr-3" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider font-['Poppins']">Location Details</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Full Address Input */}
                    <div>
                      <label htmlFor="location.address" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                        Full Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="location.address"
                          id="location.address"
                          value={landData.location.address}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                          placeholder="Enter complete land address"
                          disabled={isSearching || isLocating}
                        />
                        <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Enter the address and click the search button, or use your current location.
                      </p>
                    </div>

                    {/* Geolocation Buttons */}
                    <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleAddressSearch}
                          disabled={isSearching || isLocating}
                          className="flex-1 flex items-center justify-center p-3 bg-[#ff3b3b] rounded-lg text-white font-semibold hover:bg-[#ff6b6b] transition-colors duration-300 disabled:opacity-50"
                          title="Search and Autofill Coordinates"
                        >
                          {isSearching ? (
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <Search className="w-5 h-5 mr-2" />
                          )}
                          Search Address
                        </button>
                        <button
                          type="button"
                          onClick={handleCurrentLocationFetch}
                          disabled={isSearching || isLocating}
                          className="flex-1 flex items-center justify-center p-3 bg-[#4285F4] rounded-lg text-white font-semibold hover:bg-[#34A853] transition-colors duration-300 disabled:opacity-50"
                          title="Use Current Location"
                        >
                          {isLocating ? (
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                          ) : (
                            <LocateFixed className="w-5 h-5 mr-2" />
                          )}
                          Use Current
                        </button>
                    </div>

                    {/* Lat/Long Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="location.latitude" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                          Latitude <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="location.latitude"
                            id="location.latitude"
                            value={landData.location.latitude}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300 pl-12"
                            placeholder="Auto-filled or Manual Entry"
                            step="any"
                            disabled={isSearching || isLocating}
                          />
                          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="location.longitude" className="block text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">
                          Longitude <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="location.longitude"
                            id="location.longitude"
                            value={landData.location.longitude}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300 pl-12"
                            placeholder="Auto-filled or Manual Entry"
                            step="any"
                            disabled={isSearching || isLocating}
                          />
                          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications Grid & File Upload Sections (Omitted for brevity, they are unchanged) */}
              
              {/* Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Size (acres) */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
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
                    min="0.1"
                    step="any"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Monthly Price */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
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
                    min="1"
                    step="any"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff3b3b] transition-colors duration-300"
                    placeholder="e.g., 10000"
                  />
                </div>

                {/* Duration (months) */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
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
                    min="1"
                    step="1"
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
                      <p className="text-sm text-gray-300 mb-2">Selected files ({landData.landPhotos.length}):</p>
                      <ul className="space-y-1">
                        {Array.from(landData.landPhotos).map((file, index) => (
                          <li key={index} className="text-xs text-gray-400 bg-white/5 rounded px-3 py-1 truncate">
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
                      <p className="text-sm text-gray-300 mb-2">Selected files ({landData.landDocuments.length}):</p>
                      <ul className="space-y-1">
                        {Array.from(landData.landDocuments).map((file, index) => (
                          <li key={index} className="text-xs text-gray-400 bg-white/5 rounded px-3 py-1 truncate">
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
                  disabled={isSubmitting || isSearching || isLocating}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] text-white rounded-xl font-bold uppercase tracking-wider hover:from-[#ff6b6b] hover:to-[#ff3b3b] transition-all duration-300 ease-in-out shadow-2xl hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
                >
                  {isSubmitting ? (
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