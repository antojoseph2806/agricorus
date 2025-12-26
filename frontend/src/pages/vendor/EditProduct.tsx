import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingSafetyDocs, setExistingSafetyDocs] = useState<string[]>([]);
  
  // Validation states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<ValidationError[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Validate form whenever data changes
  const validateForm = () => {
    const formValidation = validateProductForm(formData);
    const imageValidation = validateFiles(images, 'images');
    const safetyDocValidation = validateFiles(safetyDocs, 'safetyDocuments');
    const specialValidation = validateSpecialRequirements(
      formData, 
      images, 
      existingImages, 
      safetyDocs, 
      existingSafetyDocs
    );

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

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const product = res.data.data;
        setFormData({
          name: product.name,
          category: product.category,
          price: product.price.toString(),
          stock: product.stock.toString(),
          description: product.description || "",
          warrantyPeriod: product.warrantyPeriod?.toString() || "",
        });
        setExistingImages(product.images || []);
        setExistingSafetyDocs(product.safetyDocuments || []);
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      alert(error.response?.data?.message || "Failed to fetch product");
      navigate("/vendor/products");
    } finally {
      setLoading(false);
    }
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
      if (existingImages.length + images.length + files.length > 5) {
        setFileErrors(prev => [...prev.filter(err => err.field !== 'images'), 
          { field: 'images', message: 'Maximum 5 images allowed (including existing)' }]);
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
    
    // Clear image errors when removing
    setFileErrors(prev => prev.filter(err => err.field !== 'images'));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
    
    // Clear image errors when removing
    setFileErrors(prev => prev.filter(err => err.field !== 'images'));
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

  const removeExistingSafetyDoc = (index: number) => {
    setExistingSafetyDocs(existingSafetyDocs.filter((_, i) => i !== index));
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

    setSubmitting(true);

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

      // Add new images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      // Add new safety documents
      safetyDocs.forEach((doc) => {
        formDataToSend.append("safetyDocuments", doc);
      });

      const res = await axios.put(
        `${(import.meta as any).env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendor/products/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("Product updated successfully!");
        navigate("/vendor/products");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.path || err.field] = err.message || err.msg;
        });
        setFieldErrors(backendErrors);
      } else {
        alert(
          error.response?.data?.message || "Failed to update product. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading product...</div>
        </div>
      </VendorLayout>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Equipment & Tools">Equipment & Tools</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {formData.category === "Equipment & Tools" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warranty Period (months)
                    </label>
                    <input
                      type="number"
                      name="warrantyPeriod"
                      value={formData.warrantyPeriod}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Product Images</h2>
              <p className="text-sm text-gray-600 mb-2">
                Upload up to 5 images (JPG, PNG, WEBP - Max 5MB each)
              </p>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Existing Images:
                  </p>
                  <div className="grid grid-cols-5 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`http://localhost:5000${image}`}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                    Click to upload new images
                  </span>
                </label>
              </div>

              {/* New Image Previews */}
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

                {/* Existing Safety Documents */}
                {existingSafetyDocs.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Existing Documents:
                    </p>
                    <div className="space-y-2">
                      {existingSafetyDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <a
                            href={`http://localhost:5000${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Document {index + 1}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeExistingSafetyDoc(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                      Click to upload new PDF documents
                    </span>
                  </label>
                </div>

                {/* New Safety Document List */}
                {safetyDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {safetyDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{doc.name}</span>
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
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
};

export default EditProduct;

