import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sprout,
  DollarSign,
  Calendar,
  FileText,
  Rocket,
  ArrowLeft,
  AlertCircle,
  Upload,
  MapPin,
  Shield,
  Camera,
  Video,
  FileCheck,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface MediaFile {
  file: File;
  preview: string;
  geoTag?: GeoLocation;
  description: string;
}

export default function AddProject() {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Form Steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Basic Project Info
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    cropType: "",
    fundingGoal: "",
    endDate: "",
  });

  // Farmer Verification
  const [farmerVerification, setFarmerVerification] = useState({
    aadhaarNumber: "",
    aadhaarDocument: null as File | null,
    govtIdType: "",
    govtIdNumber: "",
    govtIdDocument: null as File | null,
  });

  // Land Details
  const [landDetails, setLandDetails] = useState({
    state: "",
    district: "",
    tehsil: "",
    village: "",
    panchayat: "",
    municipality: "",
    street: "",
    landmark: "",
    pincode: "",
    surveyNumber: "",
    subDivisionNumber: "",
    landAreaValue: "",
    landAreaUnit: "",
    landType: "",
    soilType: "",
    irrigationSource: "",
    latitude: "",
    longitude: "",
  });

  // Land Ownership
  const [landOwnership, setLandOwnership] = useState({
    ownershipType: "",
    ownerName: "",
    relationToOwner: "",
    documents: [] as Array<{
      type: string;
      documentNumber: string;
      file: File;
    }>,
  });

  // Media Files
  const [landMedia, setLandMedia] = useState({
    photos: [] as MediaFile[],
    videos: [] as MediaFile[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoLocationLoading, setGeoLocationLoading] = useState(false);

  // Get current location
  const getCurrentLocation = () => {
    setGeoLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLandDetails(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          setGeoLocationLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get current location. Please enter coordinates manually.");
          setGeoLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setGeoLocationLoading(false);
    }
  };

  // Handle file uploads with geo-tagging
  const handleMediaUpload = async (files: FileList, type: 'photos' | 'videos') => {
    const newFiles: MediaFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = URL.createObjectURL(file);
      
      // Get current location for geo-tagging
      let geoTag: GeoLocation | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 60000
            });
          });
          
          geoTag = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
        } catch (error) {
          console.warn("Could not get location for media file:", error);
        }
      }
      
      newFiles.push({
        file,
        preview,
        geoTag,
        description: ""
      });
    }
    
    setLandMedia(prev => ({
      ...prev,
      [type]: [...prev[type], ...newFiles]
    }));
  };

  // Remove media file
  const removeMediaFile = (index: number, type: 'photos' | 'videos') => {
    setLandMedia(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Update media description
  const updateMediaDescription = (index: number, type: 'photos' | 'videos', description: string) => {
    setLandMedia(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, description } : item
      )
    }));
  };

  // Add ownership document
  const addOwnershipDocument = (type: string, documentNumber: string, file: File) => {
    setLandOwnership(prev => ({
      ...prev,
      documents: [...prev.documents, { type, documentNumber, file }]
    }));
  };

  // Remove ownership document
  const removeOwnershipDocument = (index: number) => {
    setLandOwnership(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(basicInfo.title && basicInfo.description && basicInfo.fundingGoal && basicInfo.endDate);
      case 2:
        return !!(farmerVerification.aadhaarNumber && farmerVerification.aadhaarDocument && 
                 farmerVerification.govtIdType && farmerVerification.govtIdNumber && farmerVerification.govtIdDocument);
      case 3:
        return !!(landDetails.state && landDetails.district && landDetails.tehsil && landDetails.village && 
                 landDetails.panchayat && landDetails.pincode && landDetails.surveyNumber && landDetails.landAreaValue && 
                 landDetails.landAreaUnit && landDetails.landType && landDetails.latitude && landDetails.longitude);
      case 4:
        return !!(landOwnership.ownershipType && landOwnership.ownerName && 
                 landOwnership.relationToOwner && landOwnership.documents.length > 0);
      case 5:
        return landMedia.photos.length >= 5 && landMedia.videos.length >= 1;
      default:
        return false;
    }
  };

  // Submit form
  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to create a project.");
        setLoading(false);
        return;
      }

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Basic info
      formData.append('title', basicInfo.title);
      formData.append('description', basicInfo.description);
      formData.append('cropType', basicInfo.cropType);
      formData.append('fundingGoal', basicInfo.fundingGoal);
      formData.append('endDate', basicInfo.endDate);

      // Farmer verification
      formData.append('aadhaarNumber', farmerVerification.aadhaarNumber);
      formData.append('govtIdType', farmerVerification.govtIdType);
      formData.append('govtIdNumber', farmerVerification.govtIdNumber);
      if (farmerVerification.aadhaarDocument) {
        formData.append('aadhaarDocument', farmerVerification.aadhaarDocument);
      }
      if (farmerVerification.govtIdDocument) {
        formData.append('govtIdDocument', farmerVerification.govtIdDocument);
      }

      // Land details
      Object.entries(landDetails).forEach(([key, value]) => {
        if (value) formData.append(`landDetails.${key}`, value);
      });

      // Land ownership
      formData.append('ownershipType', landOwnership.ownershipType);
      formData.append('ownerName', landOwnership.ownerName);
      formData.append('relationToOwner', landOwnership.relationToOwner);
      
      landOwnership.documents.forEach((doc, index) => {
        formData.append(`ownershipDocuments`, doc.file);
        formData.append(`ownershipDocumentTypes`, doc.type);
        formData.append(`ownershipDocumentNumbers`, doc.documentNumber);
      });

      // Media files
      landMedia.photos.forEach((photo, index) => {
        formData.append('landPhotos', photo.file);
        formData.append('photoDescriptions', photo.description);
        if (photo.geoTag) {
          formData.append('photoGeoTags', JSON.stringify(photo.geoTag));
        }
      });

      landMedia.videos.forEach((video, index) => {
        formData.append('landVideos', video.file);
        formData.append('videoDescriptions', video.description);
        if (video.geoTag) {
          formData.append('videoGeoTags', JSON.stringify(video.geoTag));
        }
      });

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/projects/create-verified`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/farmer/projects");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Forbidden: Only farmers can create projects.");
      } else {
        setError(err.response?.data?.error || "Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
      <div className="flex items-center min-w-max px-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold flex-shrink-0 ${
                step === currentStep
                  ? "bg-emerald-600 text-white"
                  : step < currentStep
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 ${
                  step < currentStep ? "bg-emerald-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderFarmerVerificationStep();
      case 3:
        return renderLandDetailsStep();
      case 4:
        return renderLandOwnershipStep();
      case 5:
        return renderMediaUploadStep();
      default:
        return null;
    }
  };

  // Step 1: Basic Project Information
  const renderBasicInfoStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Information</h2>
        <p className="text-sm sm:text-base text-gray-600">Tell us about your agricultural project</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            Project Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Organic Tomato Greenhouse"
            value={basicInfo.title}
            onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <Sprout className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            Crop Type
          </label>
          <input
            type="text"
            placeholder="e.g., Tomatoes, Wheat, Corn"
            value={basicInfo.cropType}
            onChange={(e) => setBasicInfo({ ...basicInfo, cropType: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            Funding Goal (₹) *
          </label>
          <input
            type="number"
            placeholder="e.g., 50000"
            value={basicInfo.fundingGoal}
            onChange={(e) => setBasicInfo({ ...basicInfo, fundingGoal: e.target.value })}
            min={100}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
            Campaign End Date *
          </label>
          <input
            type="date"
            value={basicInfo.endDate}
            onChange={(e) => setBasicInfo({ ...basicInfo, endDate: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Project Description *
        </label>
        <textarea
          placeholder="Describe your project vision, technology, and impact..."
          value={basicInfo.description}
          onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
          rows={6}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
      </div>
    </div>
  );

  // Step 2: Farmer Identity Verification
  const renderFarmerVerificationStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Identity Verification</h2>
        <p className="text-sm sm:text-base text-gray-600">Verify your identity with government documents</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-xs sm:text-sm">Identity Verification Required</h3>
            <p className="text-blue-800 text-xs sm:text-sm mt-1">
              All documents will be securely encrypted and used only for verification purposes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Aadhaar Number *
          </label>
          <input
            type="text"
            placeholder="Enter 12-digit Aadhaar number"
            value={farmerVerification.aadhaarNumber}
            onChange={(e) => setFarmerVerification({ ...farmerVerification, aadhaarNumber: e.target.value })}
            maxLength={12}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Upload Aadhaar Document *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFarmerVerification({ 
              ...farmerVerification, 
              aadhaarDocument: e.target.files?.[0] || null 
            })}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {farmerVerification.aadhaarDocument && (
            <p className="text-xs sm:text-sm text-green-600 mt-1 truncate">
              ✓ {farmerVerification.aadhaarDocument.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Government ID Type *
          </label>
          <select
            value={farmerVerification.govtIdType}
            onChange={(e) => setFarmerVerification({ ...farmerVerification, govtIdType: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select ID Type</option>
            <option value="AADHAAR">Aadhaar Card</option>
            <option value="VOTER_ID">Voter ID</option>
            <option value="DRIVING_LICENSE">Driving License</option>
            <option value="PASSPORT">Passport</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Government ID Number *
          </label>
          <input
            type="text"
            placeholder="Enter ID number"
            value={farmerVerification.govtIdNumber}
            onChange={(e) => setFarmerVerification({ ...farmerVerification, govtIdNumber: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Upload Government ID Document *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFarmerVerification({ 
              ...farmerVerification, 
              govtIdDocument: e.target.files?.[0] || null 
            })}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          {farmerVerification.govtIdDocument && (
            <p className="text-xs sm:text-sm text-green-600 mt-1 truncate">
              ✓ {farmerVerification.govtIdDocument.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Land Details (simplified for demo)
  const renderLandDetailsStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Land Details</h2>
        <p className="text-sm sm:text-base text-gray-600">Provide comprehensive information about your land</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">State *</label>
          <input
            type="text"
            placeholder="e.g., Karnataka"
            value={landDetails.state}
            onChange={(e) => setLandDetails({ ...landDetails, state: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">District *</label>
          <input
            type="text"
            placeholder="e.g., Bangalore Rural"
            value={landDetails.district}
            onChange={(e) => setLandDetails({ ...landDetails, district: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tehsil *</label>
          <input
            type="text"
            placeholder="e.g., Devanahalli"
            value={landDetails.tehsil}
            onChange={(e) => setLandDetails({ ...landDetails, tehsil: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Village *</label>
          <input
            type="text"
            placeholder="e.g., Chikkajala"
            value={landDetails.village}
            onChange={(e) => setLandDetails({ ...landDetails, village: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Panchayat *</label>
          <input
            type="text"
            placeholder="e.g., Chikkajala Gram Panchayat"
            value={landDetails.panchayat}
            onChange={(e) => setLandDetails({ ...landDetails, panchayat: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Municipality</label>
          <input
            type="text"
            placeholder="e.g., Devanahalli Municipality (if applicable)"
            value={landDetails.municipality}
            onChange={(e) => setLandDetails({ ...landDetails, municipality: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input
            type="text"
            placeholder="e.g., Near Village School"
            value={landDetails.street}
            onChange={(e) => setLandDetails({ ...landDetails, street: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Landmark</label>
          <input
            type="text"
            placeholder="e.g., Opposite Water Tank"
            value={landDetails.landmark}
            onChange={(e) => setLandDetails({ ...landDetails, landmark: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Pincode *</label>
          <input
            type="text"
            placeholder="e.g., 562110"
            value={landDetails.pincode}
            onChange={(e) => setLandDetails({ ...landDetails, pincode: e.target.value })}
            maxLength={6}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Survey Number *</label>
          <input
            type="text"
            placeholder="e.g., 123/4A"
            value={landDetails.surveyNumber}
            onChange={(e) => setLandDetails({ ...landDetails, surveyNumber: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Sub-Division Number</label>
          <input
            type="text"
            placeholder="e.g., 4A (if applicable)"
            value={landDetails.subDivisionNumber}
            onChange={(e) => setLandDetails({ ...landDetails, subDivisionNumber: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Land Area *</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="e.g., 2.5"
              value={landDetails.landAreaValue}
              onChange={(e) => setLandDetails({ ...landDetails, landAreaValue: e.target.value })}
              step="0.1"
              min="0.1"
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <select
              value={landDetails.landAreaUnit}
              onChange={(e) => setLandDetails({ ...landDetails, landAreaUnit: e.target.value })}
              className="px-2 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Unit *</option>
              <option value="ACRE">Acre</option>
              <option value="HECTARE">Hectare</option>
              <option value="BIGHA">Bigha</option>
              <option value="GUNTHA">Guntha</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Land Type *</label>
          <select
            value={landDetails.landType}
            onChange={(e) => setLandDetails({ ...landDetails, landType: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select Land Type</option>
            <option value="AGRICULTURAL">Agricultural</option>
            <option value="IRRIGATED">Irrigated</option>
            <option value="DRY_LAND">Dry Land</option>
            <option value="ORCHARD">Orchard</option>
            <option value="PLANTATION">Plantation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Soil Type</label>
          <select
            value={landDetails.soilType}
            onChange={(e) => setLandDetails({ ...landDetails, soilType: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select Soil Type</option>
            <option value="ALLUVIAL">Alluvial</option>
            <option value="BLACK">Black</option>
            <option value="RED">Red</option>
            <option value="LATERITE">Laterite</option>
            <option value="DESERT">Desert</option>
            <option value="MOUNTAIN">Mountain</option>
            <option value="SALINE">Saline</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Irrigation Source</label>
          <select
            value={landDetails.irrigationSource}
            onChange={(e) => setLandDetails({ ...landDetails, irrigationSource: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select Irrigation Source</option>
            <option value="BORE_WELL">Bore Well</option>on>
            <option value="CANAL">Canal</option>
            <option value="RIVER">River</option>
            <option value="POND">Pond</option>
            <option value="RAIN_FED">Rain Fed</option>
            <option value="DRIP">Drip Irrigation</option>
            <option value="SPRINKLER">Sprinkler</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Latitude *</label>
          <input
            type="number"
            placeholder="e.g., 13.1986"
            value={landDetails.latitude}
            onChange={(e) => setLandDetails({ ...landDetails, latitude: e.target.value })}
            step="any"
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Longitude *</label>
          <input
            type="number"
            placeholder="e.g., 77.7066"
            value={landDetails.longitude}
            onChange={(e) => setLandDetails({ ...landDetails, longitude: e.target.value })}
            step="any"
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={geoLocationLoading}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            {geoLocationLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Get Current Location</span>
            <span className="sm:hidden">Get Location</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Step 4: Land Ownership
  const renderLandOwnershipStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Land Ownership</h2>
        <p className="text-sm sm:text-base text-gray-600">Provide ownership details and supporting documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Ownership Type *</label>
          <select
            value={landOwnership.ownershipType}
            onChange={(e) => setLandOwnership({ ...landOwnership, ownershipType: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select Ownership Type</option>
            <option value="OWNED">Owned</option>
            <option value="LEASED">Leased</option>
            <option value="FAMILY_OWNED">Family Owned</option>
            <option value="COOPERATIVE">Cooperative</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
          <input
            type="text"
            placeholder="e.g., Rajesh Kumar"
            value={landOwnership.ownerName}
            onChange={(e) => setLandOwnership({ ...landOwnership, ownerName: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Relation to Owner *</label>
          <select
            value={landOwnership.relationToOwner}
            onChange={(e) => setLandOwnership({ ...landOwnership, relationToOwner: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select Relation</option>
            <option value="SELF">Self</option>
            <option value="FATHER">Father</option>
            <option value="MOTHER">Mother</option>
            <option value="SPOUSE">Spouse</option>
            <option value="BROTHER">Brother</option>
            <option value="SISTER">Sister</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Ownership Documents */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Ownership Documents</h3>
        
        {/* Add Document Form */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                id="docType"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Document Type</option>
                <option value="PATTA">Patta</option>
                <option value="KHATA">Khata</option>
                <option value="PAHANI">Pahani</option>
                <option value="KHASRA">Khasra</option>
                <option value="REVENUE_RECORD">Revenue Record</option>
                <option value="SALE_DEED">Sale Deed</option>
                <option value="LEASE_DEED">Lease Deed</option>
                <option value="MUTATION_RECORD">Mutation Record</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Document Number</label>
              <input
                type="text"
                id="docNumber"
                placeholder="e.g., PATTA/2023/001"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Upload Document</label>
              <input
                type="file"
                id="docFile"
                accept=".pdf,.jpg,.jpeg,.png"
                ref={documentInputRef}
                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const docType = (document.getElementById('docType') as HTMLSelectElement).value;
              const docNumber = (document.getElementById('docNumber') as HTMLInputElement).value;
              const docFile = documentInputRef.current?.files?.[0];
              
              if (docType && docNumber && docFile) {
                addOwnershipDocument(docType, docNumber, docFile);
                (document.getElementById('docType') as HTMLSelectElement).value = '';
                (document.getElementById('docNumber') as HTMLInputElement).value = '';
                if (documentInputRef.current) documentInputRef.current.value = '';
              }
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
          >
            <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Add Document
          </button>
        </div>

        {/* Document List */}
        {landOwnership.documents.length > 0 && (
          <div className="space-y-2">
            {landOwnership.documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 border rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{doc.type.replace('_', ' ')}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{doc.documentNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{doc.file.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeOwnershipDocument(index)}
                  className="text-red-600 hover:text-red-800 flex-shrink-0 ml-2"
                >
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Step 5: Media Upload
  const renderMediaUploadStep = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Land Media</h2>
        <p className="text-sm sm:text-base text-gray-600">Upload geo-tagged photos and videos of your land</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 text-xs sm:text-sm">Media Requirements</h3>
            <ul className="text-yellow-800 text-xs sm:text-sm mt-1 space-y-1">
              <li>• Minimum 5 photos required</li>
              <li>• Minimum 1 video required</li>
              <li>• All media will be automatically geo-tagged</li>
              <li>• Photos should show different angles of the land</li>
              <li>• Videos should provide a comprehensive view</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Land Photos ({landMedia.photos.length}/5 minimum)
        </h3>
        
        <div className="mb-3 sm:mb-4">
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleMediaUpload(e.target.files, 'photos')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Upload Photos
          </button>
        </div>

        {landMedia.photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {landMedia.photos.map((photo, index) => (
              <div key={index} className="border rounded-lg p-2 sm:p-3">
                <img
                  src={photo.preview}
                  alt={`Land photo ${index + 1}`}
                  className="w-full h-28 sm:h-32 object-cover rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Photo description..."
                  value={photo.description}
                  onChange={(e) => updateMediaDescription(index, 'photos', e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded mb-2"
                />
                {photo.geoTag && (
                  <p className="text-xs text-green-600 mb-2 truncate">
                    ✓ Geo-tagged: {photo.geoTag.latitude.toFixed(6)}, {photo.geoTag.longitude.toFixed(6)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeMediaFile(index, 'photos')}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm flex items-center"
                >
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
          <Video className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Land Videos ({landMedia.videos.length}/1 minimum)
        </h3>
        
        <div className="mb-3 sm:mb-4">
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            multiple
            onChange={(e) => e.target.files && handleMediaUpload(e.target.files, 'videos')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Upload Videos
          </button>
        </div>

        {landMedia.videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {landMedia.videos.map((video, index) => (
              <div key={index} className="border rounded-lg p-2 sm:p-3">
                <video
                  src={video.preview}
                  controls
                  className="w-full h-28 sm:h-32 object-cover rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Video description..."
                  value={video.description}
                  onChange={(e) => updateMediaDescription(index, 'videos', e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded mb-2"
                />
                {video.geoTag && (
                  <p className="text-xs text-green-600 mb-2 truncate">
                    ✓ Geo-tagged: {video.geoTag.latitude.toFixed(6)}, {video.geoTag.longitude.toFixed(6)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => removeMediaFile(index, 'videos')}
                  className="text-red-600 hover:text-red-800 text-xs sm:text-sm flex items-center"
                >
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Create Verified Project</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">Complete verification process for your agricultural project</p>
            </div>
          </div>
          
          {/* Step Indicator */}
          {renderStepIndicator()}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-xs sm:text-sm">Error</p>
              <p className="text-red-700 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Previous
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 order-1 sm:order-2">
            <button
              type="button"
              onClick={() => navigate("/farmer/projects")}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base font-semibold transition-colors duration-200"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm sm:text-base font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 ml-2 rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !validateStep(currentStep)}
                className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm sm:text-base font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Submit Project
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step Information */}
        <div className="mt-4 sm:mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-emerald-900 mb-1">
                Step {currentStep} of {totalSteps}
              </h3>
              <div className="text-xs sm:text-sm text-emerald-800">
                {currentStep === 1 && "Provide basic information about your agricultural project"}
                {currentStep === 2 && "Upload government documents for identity verification"}
                {currentStep === 3 && "Enter detailed land information including GPS coordinates"}
                {currentStep === 4 && "Provide land ownership documents and proof"}
                {currentStep === 5 && "Upload geo-tagged photos and videos of your land"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}