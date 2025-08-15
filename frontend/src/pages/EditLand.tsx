import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Route as RouteIcon,
  Badge,
  Globe,
  Loader2
} from 'lucide-react';
import { Layout } from './LandownerDashboard';

// Type definition for a single land listing
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
  documents: string[];
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
      latitude: '' as string | number, // ✅ Fix: Allow number type from API
      longitude: '' as string | number, // ✅ Fix: Allow number type from API
    },
    soilType: '',
    waterSource: '',
    accessibility: '',
    sizeInAcres: '' as string | number, // ✅ Fix: Allow number type from API
    leasePricePerMonth: '' as string | number, // ✅ Fix: Allow number type from API
    leaseDurationMonths: '' as string | number, // ✅ Fix: Allow number type from API
    newDocuments: null as FileList | null,
    existingDocuments: [] as string[]
  });

  // Fetch existing land data
  useEffect(() => {
    const fetchLandData = async () => {
      if (!id) {
        setMessage("Land ID is missing.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/landowner/lands/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const land: Land = await response.json();
          setFormData({
            title: land.title,
            location: {
              address: land.location?.address || '',
              latitude: land.location?.latitude,
              longitude: land.location?.longitude,
            },
            soilType: land.soilType,
            waterSource: land.waterSource,
            accessibility: land.accessibility,
            sizeInAcres: land.sizeInAcres,
            leasePricePerMonth: land.leasePricePerMonth,
            leaseDurationMonths: land.leaseDurationMonths,
            newDocuments: null,
            existingDocuments: land.documents || []
          });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, newDocuments: e.target.files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    const form = new FormData();
    form.append('title', formData.title);
    form.append('location.address', formData.location.address);
    form.append('location.latitude', formData.location.latitude.toString()); // ✅ Convert to string
    form.append('location.longitude', formData.location.longitude.toString()); // ✅ Convert to string
    form.append('soilType', formData.soilType);
    form.append('waterSource', formData.waterSource);
    form.append('accessibility', formData.accessibility);
    form.append('sizeInAcres', formData.sizeInAcres.toString()); // ✅ Convert to string
    form.append('leasePricePerMonth', formData.leasePricePerMonth.toString()); // ✅ Convert to string
    form.append('leaseDurationMonths', formData.leaseDurationMonths.toString()); // ✅ Convert to string

    if (formData.newDocuments) {
      for (let i = 0; i < formData.newDocuments.length; i++) {
        form.append('documents', formData.newDocuments[i]);
      }
    }

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/landowner/lands/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Land updated successfully!');
        setTimeout(() => navigate('/lands/view'), 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to update land. Please try again.');
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
        <div className="text-center py-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading land details for editing...
        </div>
      </Layout>
    );
  }

  if (status === 'success' && message) {
    return (
      <Layout>
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center shadow-sm">
          <CheckCircle className="w-5 h-5 mr-3 text-green-600" />
          <p className="font-medium">{message}</p>
        </div>
      </Layout>
    );
  }
  
  if (status === 'error' && message) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center shadow-sm">
          <XCircle className="w-5 h-5 mr-3 text-red-600" />
          <p className="font-medium">{message}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Land Listing</h1>
        <p className="text-gray-600 mb-8">
          Update the details of your land listing below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Badge className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="e.g., 5-acre agricultural plot"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-1">
                  Soil Type <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tractor className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="soilType"
                    id="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="e.g., Alluvial, Red soil"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="waterSource" className="block text-sm font-medium text-gray-700 mb-1">
                  Water Source
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Waves className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="waterSource"
                    id="waterSource"
                    value={formData.waterSource}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="e.g., Borewell, River"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="accessibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Accessibility
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RouteIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="accessibility"
                    id="accessibility"
                    value={formData.accessibility}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    placeholder="e.g., Road access"
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-6">
              <fieldset className="border border-gray-200 rounded-md p-6 bg-gray-50">
                <legend className="text-lg font-medium text-gray-900 px-2">Location</legend>
                <div className="mt-2 space-y-4">
                  <div>
                    <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="relative mt-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="location.address"
                        id="location.address"
                        value={formData.location.address}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        placeholder="e.g., Anakkara, Palakkad"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location.latitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="location.latitude"
                          id="location.latitude"
                          value={formData.location.latitude}
                          onChange={handleChange}
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                          placeholder="e.g., 10.7867"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="location.longitude" className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="location.longitude"
                          id="location.longitude"
                          value={formData.location.longitude}
                          onChange={handleChange}
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                          placeholder="e.g., 76.6578"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label htmlFor="sizeInAcres" className="block text-sm font-medium text-gray-700 mb-1">
                Size (in acres) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Text className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="sizeInAcres"
                  id="sizeInAcres"
                  value={formData.sizeInAcres}
                  onChange={handleChange}
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="e.g., 5"
                />
              </div>
            </div>
            <div>
              <label htmlFor="leasePricePerMonth" className="block text-sm font-medium text-gray-700 mb-1">
                Lease Price (per month) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="leasePricePerMonth"
                  id="leasePricePerMonth"
                  value={formData.leasePricePerMonth}
                  onChange={handleChange}
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="e.g., 10000"
                />
              </div>
            </div>
            <div>
              <label htmlFor="leaseDurationMonths" className="block text-sm font-medium text-gray-700 mb-1">
                Lease Duration (in months) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="leaseDurationMonths"
                  id="leaseDurationMonths"
                  value={formData.leaseDurationMonths}
                  onChange={handleChange}
                  required
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Documents
            </label>
            {formData.existingDocuments.length > 0 ? (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                {formData.existingDocuments.map((doc, index) => (
                  <li key={index}>{doc.split('/').pop()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No documents currently uploaded.</p>
            )}
          </div>
          
          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-2">
              Add New Documents
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="space-y-1 text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                    <span>Upload files</span>
                    <input id="file-upload" name="documents" type="file" multiple className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB each</p>
              </div>
            </div>
            {formData.newDocuments && (
              <ul className="mt-4 text-sm text-gray-600 list-disc list-inside">
                {Array.from(formData.newDocuments).map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-5">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Update Land
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditLand;