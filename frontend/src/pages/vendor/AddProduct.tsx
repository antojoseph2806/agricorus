import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VendorLayout from "./VendorLayout";
import FormField from "../../components/vendor/FormField";
import { ArrowLeft, Upload, X, AlertTriangle, CheckCircle } from "lucide-react";
import { 
  validateProductForm, 
  validateFiles, 
  validateSpecialRequirements, 
  validateField,
  ProductFormData,
  ValidationError 
} from "../../utils/productValidation";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "Fertilizers",
    price: "",
    stock: "",
    description: "",
    warrantyPeriod: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [safetyDocs, setSafetyDocs] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Validation states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<ValidationError[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Validate form whenever data changes
  const validateForm = () => {
    const formValidation = validateProductForm(formData);
    const imageValidation = validateFiles(images, 'images');
    const safetyDocValidation = validateFiles(safetyDocs, 'safetyDocuments');
    const specialValidation = validateSpecialRequirements(formData, images, [], safetyDocs, []);

    const allErrors = [
      ...imageValidation,
      ...safetyDocValidation,
      ...specialValidation
    ];

    setFileErrors(allErrors);
    
    // Convert form validation errors to field errors
    const newFieldErrors: Record<string, string> = {};
    formValidation.errors.forEach(error => {
      newFieldErrors[error.field] = error.message;
    });
    setFieldErrors(newFieldErrors);

    const isValid = formValidation.isValid && allErrors.length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value, formData);
    
    if (error) {
      setFieldErrors({ ...fieldErrors, [name]: error });
    } else {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate files before adding
      const validationErrors = validateFiles(files, 'images');
      if (validationErrors.length > 0) {
        setFileErrors(prev => [...prev.filter(err => err.field !== 'images'), ...validationErrors]);
        return;
      }

      // Check total count including existing images
      if (images.length + files.length > 5) {
        setFileErrors(prev => [...prev.filter(err => err.field !== 'images'), 
          { field: 'images', message: 'Maximum 5 images allowed' }]);
        return;
      }

      const newImages = [...images, ...files];
      setImages(newImages);

      // Create previews
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
      
      // Clear image errors
      setFileErrors(prev => prev.filter(err => err.field !== 'images'));
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSafetyDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate files before adding
      const validationErrors = validateFiles(files, 'safetyDocuments');
      if (validationErrors.length > 0) {
        setFileErrors(prev => [...prev.filter(err => err.field !== 'safetyDocuments'), ...validationErrors]);
        return;
      }

      setSafetyDocs([...safetyDocs, ...files]);
      
      // Clear safety doc errors
      setFileErrors(prev => prev.filter(err => err.field !== 'safetyDocuments'));
    }
  };

  const removeSafetyDoc = (index: number) => {
    setSafetyDocs(safetyDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    // Validate entire form
    const isValid = validateForm();
    
    if (!isValid) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.text-red-600');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Add form fields
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      if (formData.description.trim()) {
        formDataToSend.append("description", formData.description.trim());
      }
      if (formData.category === "Equipment & Tools" && formData.warrantyPeriod.trim()) {
        formDataToSend.append("warrantyPeriod", formData.warrantyPeriod);
      }

      // Add images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // Add safety documents
      safetyDocs.forEach((doc) => {
        formDataToSend.append("safetyDocuments", doc);
      });

      const res = await axios.post(
        `${(import.meta as any).env.VITE_BACKEND_URL || "https://agricorus.onrender.com"}/api/vendor/products`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("Product created successfully!");
        navigate("/vendor/products");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.path || err.field] = err.message || err.msg;
        });
        setFieldErrors(backendErrors);
      } else {
        alert(
          error.response?.data?.message || "Failed to create product. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/vendor/products")}
              className="p-2 hover:bg-gray-200 rounded"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Validation Summary */}
            {showValidation && (Object.keys(fieldErrors).length > 0 || fileErrors.length > 0) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(fieldErrors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                  {fileErrors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success indicator */}
            {showValidation && isFormValid && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Form is valid and ready to submit!</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <FormField
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={fieldErrors.name}
                  required
                  placeholder="Enter product name (3-200 characters)"
                  helpText="Use descriptive names with letters, numbers, spaces, hyphens, dots, parentheses, and ampersands only"
                />

                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={fieldErrors.category}
                  required
                  options={[
                    { value: "Fertilizers", label: "Fertilizers" },
                    { value: "Pesticides", label: "Pesticides" },
                    { value: "Equipment & Tools", label: "Equipment & Tools" }
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Price (₹)"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={fieldErrors.price}
                    required
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    placeholder="0.00"
                    helpText="Enter price between ₹0.01 and ₹10,00,000"
                  />

                  <FormField
                    label="Stock Quantity"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={fieldErrors.stock}
                    required
                    min="0"
                    max="999999"
                    step="1"
                    placeholder="0"
                    helpText="Enter whole numbers only (0-999,999)"
                  />
                </div>

                {formData.category === "Equipment & Tools" && (
                  <FormField
                    label="Warranty Period (months)"
                    name="warrantyPeriod"
                    type="number"
                    value={formData.warrantyPeriod}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={fieldErrors.warrantyPeriod}
                    min="0"
                    max="120"
                    step="1"
                    placeholder="0"
                    helpText="Optional: Enter warranty period in months (0-120)"
                  />
                )}

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={fieldErrors.description}
                  rows={4}
                  placeholder="Describe your product features, benefits, and specifications..."
                  helpText={`Optional: Detailed product description (${formData.description.length}/2000 characters)`}
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Product Images</h2>
              <p className="text-sm text-gray-600 mb-2">
                Upload up to 5 images (JPG, PNG, WEBP - Max 5MB each)
              </p>

              <div className={`border-2 border-dashed rounded-lg p-6 ${
                fileErrors.some(err => err.field === 'images') 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload images ({images.length}/5)
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Supported: JPG, PNG, WEBP (Max 5MB each)
                  </span>
                </label>
              </div>

              {/* File validation errors */}
              {fileErrors.filter(err => err.field === 'images').map((error, index) => (
                <div key={index} className="flex items-center space-x-1 text-red-600 mt-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{error.message}</span>
                </div>
              ))}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {(images[index]?.size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety Documents (for Pesticides) */}
            {formData.category === "Pesticides" && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Safety Documents <span className="text-red-500">*</span>
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  Upload safety documents (PDF only - Max 10MB each)
                </p>

                <div className={`border-2 border-dashed rounded-lg p-6 ${
                  fileErrors.some(err => err.field === 'safetyDocuments') 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleSafetyDocChange}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload PDF documents ({safetyDocs.length} uploaded)
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Required for Pesticides - PDF only (Max 10MB each)
                    </span>
                  </label>
                </div>

                {/* File validation errors */}
                {fileErrors.filter(err => err.field === 'safetyDocuments').map((error, index) => (
                  <div key={index} className="flex items-center space-x-1 text-red-600 mt-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{error.message}</span>
                  </div>
                ))}

                {/* Safety Document List */}
                {safetyDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {safetyDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700">{doc.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(doc.size / (1024 * 1024)).toFixed(1)}MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSafetyDoc(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/vendor/products")}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-2 rounded-lg transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : showValidation && !isFormValid
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white disabled:opacity-50`}
              >
                {loading ? "Creating..." : showValidation && !isFormValid ? "Fix Errors & Create" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
};

export default AddProduct;

