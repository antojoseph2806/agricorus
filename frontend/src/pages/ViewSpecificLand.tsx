import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  DollarSign,
  Text,
  Calendar,
  Tractor,
  Waves,
  Route as RouteIcon,
  Badge,
  Globe,
  Loader2,
  FileText
} from 'lucide-react';
import { Layout } from './LandownerDashboard';

// Define the type for a single land listing
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
  status: 'available' | 'leased' | 'inactive';
  documents: string[];
}

const ViewSpecificLand: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLand = async () => {
      if (!id) {
        setError("Land ID is missing.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/landowner/lands/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLand(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch land details.');
        }
      } catch (err) {
        setError('An error occurred. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchLand();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading land details...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10 text-red-600">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  if (!land) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500">
          <p>Land not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{land.title}</h1>
        <p className="text-gray-600 mb-8 flex items-center">
          <MapPin className="w-5 h-5 text-gray-500 mr-2" />
          {land.location.address}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Land Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Key Details</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Badge className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span>Status: <span className="font-medium capitalize">{land.status}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Tractor className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span>Soil Type: <span className="font-medium">{land.soilType}</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Text className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span>Size: <span className="font-medium">{land.sizeInAcres} acres</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <DollarSign className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span>Lease Price: <span className="font-medium">₹{land.leasePricePerMonth} / month</span></span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span>Lease Duration: <span className="font-medium">{land.leaseDurationMonths} months</span></span>
              </div>
              {land.waterSource && (
                <div className="flex items-center text-gray-700">
                  <Waves className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  <span>Water Source: <span className="font-medium">{land.waterSource}</span></span>
                </div>
              )}
              {land.accessibility && (
                <div className="flex items-center text-gray-700">
                  <RouteIcon className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  <span>Accessibility: <span className="font-medium">{land.accessibility}</span></span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Documents & Images */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">Documents</h2>
            
            {/* Display first document as a main image */}
            {land.documents && land.documents.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                {land.documents[0].match(/\.(jpeg|jpg|gif|png)$/) ? (
                  <img
                    src={land.documents[0]}
                    alt={`Document ${1}`}
                    className="max-h-96 w-full object-contain rounded-md shadow-md"
                  />
                ) : (
                  <div className="p-12 text-gray-400">
                    <FileText className="mx-auto w-16 h-16" />
                    <p className="mt-2 text-sm">Preview not available</p>
                  </div>
                )}
              </div>
            )}

            {/* List other documents */}
            {land.documents && land.documents.length > 1 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Other Documents</h3>
                <ul className="space-y-2">
                  {land.documents.slice(1).map((doc, index) => (
                    <li key={index} className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <FileText className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-800 hover:underline break-all"
                      >
                        Document {index + 2}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Case for no documents */}
            {(!land.documents || land.documents.length === 0) && (
              <p className="text-gray-500">No documents uploaded for this land.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewSpecificLand;