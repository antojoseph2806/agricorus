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
  FileText,
  Upload,
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
      <div className="max-w-5xl mx-auto">
        {/* Header Section with Gradient */}
        <div className="relative mb-8">
          {/* Background Gradient Banner */}
          <div className="h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
          </div>

          {/* Icon Badge */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <MapPin className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mt-16 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">List New Land</h1>
          <p className="text-gray-500 mt-2">Add your land listing to our platform. Fill in the details below.</p>
        </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Land Information</h2>
              <p className="text-gray-500 text-sm mt-1">Provide complete details about your land</p>
            </div>

            {/* Card Body */}
            <div className="p-8">
            {/* Status Messages */}
            {(status === 'success' || status === 'error' || isLocating || isSearching) && (
              <div className={`mb-6 p-5 rounded-xl flex items-center border
                ${status === 'success' ? 'bg-emerald-50 border-emerald-200' : 
                  (status === 'error' ? 'bg-red-50 border-red-200' : 
                  'bg-blue-50 border-blue-200')
                }`}>
                {isLocating || isSearching ? 
                  <Loader className="w-5 h-5 animate-spin mr-3 text-blue-600" /> : 
                  (status === 'success' ? <CheckCircle className="w-5 h-5 mr-3 text-emerald-600" /> : <XCircle className="w-5 h-5 mr-3 text-red-600" />)
                }
                <div>
                  <p className={`font-semibold ${status === 'success' ? 'text-emerald-900' : (status === 'error' ? 'text-red-900' : 'text-blue-900')}`}>
                    {isLocating ? 'Fetching Current Location...' : (isSearching ? 'Searching Coordinates...' : (status === 'success' ? 'Success!' : 'Error'))}
                  </p>
                  <p className={`text-sm ${status === 'success' ? 'text-emerald-700' : (status === 'error' ? 'text-red-700' : 'text-blue-700')}`}>
                    {message}
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Land Title */}
              <div>
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Badge className="w-4 h-4 text-emerald-500" />
                  Land Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={landData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                  placeholder="e.g., Premium 5-Acre Agricultural Plot"
                />
              </div>

              {/* Location Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-emerald-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Location Details</h3>
                </div>

                <div className="space-y-4">
                  {/* Full Address */}
                  <div>
                    <label htmlFor="location.address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="location.address"
                      id="location.address"
                      value={landData.location.address}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-gray-800 font-medium"
                      placeholder="Enter complete land address"
                      disabled={isSearching || isLocating}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the address and click search, or use your current location
                    </p>
                  </div>

                  {/* Geolocation Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      disabled={isSearching || isLocating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                    >
                      {isSearching ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                      Search Address
                    </button>
                    <button
                      type="button"
                      onClick={handleCurrentLocationFetch}
                      disabled={isSearching || isLocating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
                    >
                      {isLocating ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <LocateFixed className="w-5 h-5" />
                      )}
                      Use Current
                    </button>
                  </div>

                  {/* Lat/Long */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location.latitude" className="block text-sm font-semibold text-gray-700 mb-2">
                        Latitude <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="location.latitude"
                        id="location.latitude"
                        value={landData.location.latitude}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-gray-800 font-medium"
                        placeholder="Auto-filled"
                        step="any"
                        disabled={isSearching || isLocating}
                      />
                    </div>
                    <div>
                      <label htmlFor="location.longitude" className="block text-sm font-semibold text-gray-700 mb-2">
                        Longitude <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="location.longitude"
                        id="location.longitude"
                        value={landData.location.longitude}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-gray-800 font-medium"
                        placeholder="Auto-filled"
                        step="any"
                        disabled={isSearching || isLocating}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Soil Type */}
                <div>
                  <label htmlFor="soilType" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Tractor className="w-4 h-4 text-emerald-500" />
                    Soil Type <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="soilType"
                    id="soilType"
                    value={landData.soilType}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="e.g., Alluvial, Red Soil"
                  />
                </div>

                {/* Water Source */}
                <div>
                  <label htmlFor="waterSource" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Waves className="w-4 h-4 text-emerald-500" />
                    Water Source
                  </label>
                  <input
                    type="text"
                    name="waterSource"
                    id="waterSource"
                    value={landData.waterSource}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="e.g., Borewell, River"
                  />
                </div>

                {/* Accessibility */}
                <div className="md:col-span-2">
                  <label htmlFor="accessibility" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Route className="w-4 h-4 text-emerald-500" />
                    Accessibility
                  </label>
                  <input
                    type="text"
                    name="accessibility"
                    id="accessibility"
                    value={landData.accessibility}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="e.g., Paved Road Access, Highway Nearby"
                  />
                </div>
              </div>
              
              {/* Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Size */}
                <div>
                  <label htmlFor="sizeInAcres" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Text className="w-4 h-4 text-emerald-500" />
                    Size (acres) <span className="text-red-600">*</span>
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
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Monthly Price */}
                <div>
                  <label htmlFor="leasePricePerMonth" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Monthly Price <span className="text-red-600">*</span>
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
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="e.g., 10000"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="leaseDurationMonths" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    Duration (months) <span className="text-red-600">*</span>
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
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-800 font-medium"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              {/* File Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photos Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Image className="w-4 h-4 text-emerald-500" />
                    Land Photos <span className="text-gray-500 text-xs">(Max 5)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all text-center">
                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <label htmlFor="photo-upload-input" className="cursor-pointer">
                      <span className="text-emerald-600 font-medium hover:text-emerald-700">Upload photos</span>
                      <input id="photo-upload-input" name="landPhotos" type="file" multiple accept=".png, .jpg, .jpeg" className="sr-only" onChange={handlePhotoChange} />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB each</p>
                  </div>
                  {landData.landPhotos && (
                    <div className="mt-3 space-y-1">
                      {Array.from(landData.landPhotos).map((file, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-emerald-50 rounded-lg px-3 py-2 flex items-center gap-2">
                          <Image className="w-3 h-3 text-emerald-600" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Land Documents <span className="text-gray-500 text-xs">(Max 5)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all text-center">
                    <Cloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <label htmlFor="document-upload-input" className="cursor-pointer">
                      <span className="text-emerald-600 font-medium hover:text-emerald-700">Upload documents</span>
                      <input id="document-upload-input" name="landDocuments" type="file" multiple accept=".pdf" className="sr-only" onChange={handleDocumentChange} />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PDFs up to 5MB each</p>
                  </div>
                  {landData.landDocuments && (
                    <div className="mt-3 space-y-1">
                      {Array.from(landData.landDocuments).map((file, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2">
                          <FileText className="w-3 h-3 text-blue-600" />
                          {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isSearching || isLocating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Listing Land...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      List Land
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

export default AddLand;