import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  X
} from "lucide-react";

interface VendorProfileData {
  _id?: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    district: string;
    state: string;
    pincode: string;
  };
  businessType: string;
  establishedYear: string;
  gstin: string;
  panNumber: string;
  aadharNumber: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  panCard?: string;
  aadharCard?: string;
  bankProof?: string;
  gstCertificate?: string;
  businessLicense?: string;
  kycStatus?: "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
}

const VendorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [formData, setFormData] = useState<VendorProfileData>({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: {
      street: "",
      district: "",
      state: "",
      pincode: "",
    },
    businessType: "",
    establishedYear: "",
    gstin: "",
    panNumber: "",
    aadharNumber: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const [files, setFiles] = useState<{
    panCard?: File;
    aadharCard?: File;
    bankProof?: File;
    gstCertificate?: File;
    businessLicense?: File;
  }>({});

  const [filePreviews, setFilePreviews] = useState<{
    panCard?: string;
    aadharCard?: string;
    bankProof?: string;
    gstCertificate?: string;
    businessLicense?: string;
  }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://agricorus.onrender.com/api/vendor/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.data) {
        const profileData = res.data.data;
        setProfile(profileData);
        setFormData({
          businessName: profileData.businessName || "",
          ownerName: profileData.ownerName || "",
          phone: profileData.phone || "",
          email: profileData.email || "",
          address: {
            street: profileData.address?.street || "",
            district: profileData.address?.district || "",
            state: profileData.address?.state || "",
            pincode: profileData.address?.pincode || "",
          },
          businessType: profileData.businessType || "",
          establishedYear: profileData.establishedYear?.toString() || "",
          gstin: profileData.gstin || "",
          panNumber: profileData.panNumber || "",
          aadharNumber: profileData.aadharNumber || "",
          bankDetails: {
            accountHolderName: profileData.bankDetails?.accountHolderName || "",
            accountNumber: profileData.bankDetails?.accountNumber || "",
            ifscCode: profileData.bankDetails?.ifscCode || "",
            bankName: profileData.bankDetails?.bankName || "",
          },
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else if (name.startsWith("bankDetails.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        bankDetails: { ...formData.bankDetails, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      setFiles({ ...files, [field]: file });
      const preview = URL.createObjectURL(file);
      setFilePreviews({ ...filePreviews, [field]: preview });
    } else {
      const newFiles = { ...files };
      delete newFiles[field as keyof typeof files];
      setFiles(newFiles);
      
      const newPreviews = { ...filePreviews };
      delete newPreviews[field as keyof typeof filePreviews];
      setFilePreviews(newPreviews);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.businessName &&
          formData.ownerName &&
          formData.phone &&
          formData.email &&
          formData.address.street &&
          formData.address.district &&
          formData.address.state &&
          formData.address.pincode &&
          formData.businessType
        );
      case 2:
        return !!(
          formData.panNumber &&
          formData.bankDetails.accountHolderName &&
          formData.bankDetails.accountNumber &&
          formData.bankDetails.ifscCode &&
          formData.bankDetails.bankName
        );
      case 3:
        return !!(files.panCard && files.bankProof);
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      alert("Please complete all required fields and upload required documents");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "address" || key === "bankDetails") {
          Object.entries(value as object).forEach(([subKey, subValue]) => {
            formDataToSend.append(`${key}.${subKey}`, subValue as string);
          });
        } else if (value) {
          formDataToSend.append(key, value as string);
        }
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file);
        }
      });

      const url = profile
        ? "https://agricorus.onrender.com/api/vendor/profile"
        : "https://agricorus.onrender.com/api/vendor/profile";
      const method = profile ? "PUT" : "POST";

      const res = await axios[method.toLowerCase() as "post" | "put"](
        url,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert(
          profile
            ? "Profile updated successfully!"
            : "Profile created and KYC submitted successfully!"
        );
        fetchProfile();
      }
    } catch (error: any) {
      console.error("Error submitting profile:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit profile. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getKYCStatusBadge = () => {
    if (!profile?.kycStatus) return null;

    const status = profile.kycStatus;
    switch (status) {
      case "VERIFIED":
        return {
          label: "Verified",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle2,
        };
      case "SUBMITTED":
        return {
          label: "Submitted",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-800",
          icon: XCircle,
        };
      default:
        return {
          label: "Pending",
          color: "bg-gray-100 text-gray-800",
          icon: AlertCircle,
        };
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </VendorLayout>
    );
  }

  const statusBadge = getKYCStatusBadge();
  const isVerified = profile?.kycStatus === "VERIFIED";
  const isReadOnly = isVerified;

  return (
    <VendorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Vendor Profile & KYC</h1>
            {statusBadge && (
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}
                >
                  <statusBadge.icon className="w-4 h-4" />
                  {statusBadge.label}
                </span>
                {profile?.rejectionReason && (
                  <div className="text-sm text-red-600">
                    Reason: {profile.rejectionReason}
                  </div>
                )}
              </div>
            )}
          </div>

          {!isVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  Complete KYC to activate products & receive orders
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    disabled={isReadOnly}
                  >
                    <option value="">Select Business Type</option>
                    <option value="Individual">Individual</option>
                    <option value="Partnership">Partnership</option>
                    <option value="PvtLtd">Private Limited</option>
                    <option value="LLP">LLP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    readOnly={isReadOnly}
                  />
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-4">Address</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    readOnly={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      pattern="[0-9]{6}"
                      maxLength={6}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: KYC & Bank Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">KYC & Bank Details</h2>
                
                <h3 className="text-xl font-semibold">KYC Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      maxLength={10}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                      required
                      readOnly={isReadOnly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      pattern="[0-9]{12}"
                      maxLength={12}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                    readOnly={isReadOnly}
                  />
                </div>

                <h3 className="text-xl font-semibold mt-6">Bank Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankDetails.accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    readOnly={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                      readOnly={isReadOnly}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankDetails.ifscCode"
                      value={formData.bankDetails.ifscCode}
                      onChange={handleInputChange}
                      pattern="[A-Z]{4}0[A-Z0-9]{6}"
                      maxLength={11}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                      required
                      readOnly={isReadOnly}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: SBIN0001234</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">Document Upload</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* PAN Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Card <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) =>
                          handleFileChange("panCard", e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="panCard"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="panCard"
                        className={`flex flex-col items-center justify-center cursor-pointer ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {filePreviews.panCard || profile?.panCard
                            ? "Change File"
                            : "Upload PAN Card"}
                        </span>
                      </label>
                      {(filePreviews.panCard || profile?.panCard) && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {filePreviews.panCard ? "New file selected" : "File uploaded"}
                          </span>
                          {!isReadOnly && filePreviews.panCard && (
                            <button
                              type="button"
                              onClick={() => handleFileChange("panCard", null)}
                              className="text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Proof */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Proof <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) =>
                          handleFileChange("bankProof", e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="bankProof"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="bankProof"
                        className={`flex flex-col items-center justify-center cursor-pointer ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {filePreviews.bankProof || profile?.bankProof
                            ? "Change File"
                            : "Upload Bank Proof"}
                        </span>
                      </label>
                      {(filePreviews.bankProof || profile?.bankProof) && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {filePreviews.bankProof ? "New file selected" : "File uploaded"}
                          </span>
                          {!isReadOnly && filePreviews.bankProof && (
                            <button
                              type="button"
                              onClick={() => handleFileChange("bankProof", null)}
                              className="text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar Card
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) =>
                          handleFileChange("aadharCard", e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="aadharCard"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="aadharCard"
                        className={`flex flex-col items-center justify-center cursor-pointer ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {filePreviews.aadharCard || profile?.aadharCard
                            ? "Change File"
                            : "Upload Aadhaar Card"}
                        </span>
                      </label>
                      {(filePreviews.aadharCard || profile?.aadharCard) && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {filePreviews.aadharCard ? "New file selected" : "File uploaded"}
                          </span>
                          {!isReadOnly && filePreviews.aadharCard && (
                            <button
                              type="button"
                              onClick={() => handleFileChange("aadharCard", null)}
                              className="text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GST Certificate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Certificate
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) =>
                          handleFileChange("gstCertificate", e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="gstCertificate"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="gstCertificate"
                        className={`flex flex-col items-center justify-center cursor-pointer ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {filePreviews.gstCertificate || profile?.gstCertificate
                            ? "Change File"
                            : "Upload GST Certificate"}
                        </span>
                      </label>
                      {(filePreviews.gstCertificate || profile?.gstCertificate) && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {filePreviews.gstCertificate ? "New file selected" : "File uploaded"}
                          </span>
                          {!isReadOnly && filePreviews.gstCertificate && (
                            <button
                              type="button"
                              onClick={() => handleFileChange("gstCertificate", null)}
                              className="text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business License */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business License
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) =>
                          handleFileChange("businessLicense", e.target.files?.[0] || null)
                        }
                        className="hidden"
                        id="businessLicense"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="businessLicense"
                        className={`flex flex-col items-center justify-center cursor-pointer ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {filePreviews.businessLicense || profile?.businessLicense
                            ? "Change File"
                            : "Upload Business License"}
                        </span>
                      </label>
                      {(filePreviews.businessLicense || profile?.businessLicense) && (
                        <div className="mt-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            {filePreviews.businessLicense ? "New file selected" : "File uploaded"}
                          </span>
                          {!isReadOnly && filePreviews.businessLicense && (
                            <button
                              type="button"
                              onClick={() => handleFileChange("businessLicense", null)}
                              className="text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep(currentStep)) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      alert("Please complete all required fields");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || isReadOnly || !validateStep(3)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Submitting..."
                    : profile
                    ? "Update Profile"
                    : "Submit KYC"}
                </button>
              )}
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    currentStep === step
                      ? "bg-green-600"
                      : currentStep > step
                      ? "bg-green-300"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorProfile;

