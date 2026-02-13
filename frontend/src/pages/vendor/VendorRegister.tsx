import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from "lucide-react";
import Navbar from "../../components/Navbar";

const VendorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "businessName":
        if (!value.trim()) return "Business name is required";
        if (value.trim().length < 2) return "Business name must be at least 2 characters";
        if (value.trim().length > 100) return "Business name must be less than 100 characters";
        return "";

      case "ownerName":
        if (!value.trim()) return "Owner name is required";
        if (value.trim().length < 2) return "Owner name must be at least 2 characters";
        if (value.trim().length > 50) return "Owner name must be less than 50 characters";
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return "Owner name should contain only letters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        return "";

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^[6-9]\d{9}$/.test(value.replace(/\D/g, ""))) {
          return "Please enter a valid 10-digit Indian phone number";
        }
        return "";

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
        if (!/(?=.*[@$!%*?&])/.test(value)) return "Password must contain at least one special character (@$!%*?&)";
        return "";

      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== form.password) return "Passwords do not match";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number (only digits)
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setForm({ ...form, [name]: digitsOnly });
      }
    } else {
      setForm({ ...form, [name]: value });
    }

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, name === "phone" ? value.replace(/\D/g, "") : value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, name === "phone" ? value.replace(/\D/g, "") : value);
    setErrors({ ...errors, [name]: error });
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const passwordStrengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const passwordStrengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key as keyof typeof form]);
      if (error) {
        newErrors[key] = error;
        setTouched((prev) => ({ ...prev, [key]: true }));
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/vendors/register`, {
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (res.data.success) {
        alert("Vendor registered successfully! Please login.");
        navigate("/vendor/login");
      } else {
        setErrors({ submit: res.data.message || "Registration failed. Please try again." });
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response?.data?.message || err.response?.data?.error || errorMessage;
      } else if (err.request) {
        // Request made but no response received
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 py-6 pt-24">
        <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl mb-3 shadow-lg">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Vendor Registration</h1>
          <p className="text-sm text-gray-600">Join our marketplace and start selling</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-3">
            {errors.submit && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Business Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your business name"
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 transition ${
                    errors.businessName && touched.businessName
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.businessName && touched.businessName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Owner Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter owner's full name"
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 transition ${
                    errors.ownerName && touched.ownerName
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.ownerName && touched.ownerName && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.ownerName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="vendor@example.com"
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 transition ${
                    errors.email && touched.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 transition ${
                    errors.phone && touched.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter a strong password"
                  className={`block w-full pl-9 pr-9 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 transition ${
                    errors.password && touched.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5">
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-0.5 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrengthColors[passwordStrength - 1] || "bg-gray-300"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-600">
                    Strength: {passwordStrengthLabels[passwordStrength - 1] || "Very Weak"}
                  </p>
                </div>
              )}
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  className={`block w-full pl-9 pr-9 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 transition ${
                    errors.confirmPassword && touched.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-green-500"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
              {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link
                to="/vendor/login"
                className="text-green-600 font-semibold hover:text-green-700 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default VendorRegister;
