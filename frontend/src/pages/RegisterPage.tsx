// src/pages/RegisterPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  User,
} from "lucide-react";
import GoogleButton from "../components/GoogleButton";
import AlertMessage from "../components/AlertMessage";
import Navbar from "../components/Navbar";

/**
 * Full-length RegisterPage with OTP modal and full validation.
 * - Fully responsive for mobile devices
 * - Optimized layout for small screens
 */

// ----------------- Validation helpers -----------------
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const domainParts = email.split("@")[1]?.split(".");
  return domainParts && domainParts.length <= 3;
};

const isValidPhone = (phone: string): boolean => {
  const sanitized = phone.replace(/^(\+91)?/, "");
  if (!/^[6-9]\d{9}$/.test(sanitized)) return false;
  const fakeNumbers = [
    "1234567890",
    "1111111111",
    "2222222222",
    "3333333333",
    "4444444444",
    "5555555555",
    "6666666666",
    "7777777777",
    "8888888888",
    "9999999999",
    "0000000000",
  ];
  return !fakeNumbers.includes(sanitized);
};

const isStrongPassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
};

// ----------------- Types -----------------
type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
};

type ErrorsState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
};

// ----------------- Component -----------------
const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [formErrors, setFormErrors] = useState<ErrorsState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP modal state
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const resendTimerRef = useRef<number | null>(null);

  const navigate = useNavigate();

  // ----------------- Field Validation -----------------
  const validateField = (name: keyof FormState, value: string): string => {
    // required checks
    if (value.trim() === "") {
      switch (name) {
        case "name":
          return "Name is required.";
        case "email":
          return "Email is required.";
        case "phone":
          return "Phone is required.";
        case "password":
          return "Password is required.";
        case "confirmPassword":
          return "Confirm password is required.";
        case "role":
          return "Please select a role.";
        default:
          return "";
      }
    }

    switch (name) {
      case "name":
        if (value.trim().length < 3) return "Name must be at least 3 characters.";
        if (/\d/.test(value)) return "Name cannot contain numbers.";
        return "";
      case "email":
        if (!isValidEmail(value)) return "Enter a valid email with up to 2 subdomains.";
        return "";
      case "phone":
        if (!isValidPhone(value)) return "Enter a valid 10-digit Indian phone number.";
        return "";
      case "password":
        if (!isStrongPassword(value))
          return "Password must be 8+ characters, include uppercase, lowercase, number & special character.";
        return "";
      case "confirmPassword":
        if (value !== formData.password) return "Passwords do not match.";
        return "";
      case "role":
        return "";
      default:
        return "";
    }
  };

  const validateAll = (): boolean => {
    const keys: (keyof FormState)[] = [
      "name",
      "email",
      "phone",
      "password",
      "confirmPassword",
      "role",
    ];
    const newErrors: Partial<ErrorsState> = {};
    let hasError = false;
    for (const key of keys) {
      const err = validateField(key, formData[key]);
      if (err) {
        (newErrors as any)[key] = err;
        hasError = true;
      } else {
        (newErrors as any)[key] = "";
      }
    }
    setFormErrors((prev) => ({ ...prev, ...(newErrors as ErrorsState) }));
    return !hasError;
  };

  // ----------------- Handlers -----------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setAlert(null);
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setAlert(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormState;
    const error = validateField(key, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  // ----------------- Submit Registration -----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (!validateAll()) {
      setAlert({ type: "error", message: "Please correct the highlighted errors before submitting." });
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedPhone = formData.phone.replace(/^(\+91)?/, "");
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, phone: sanitizedPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend returns field errors, map them (if available)
        setAlert({ type: "error", message: data.msg || "Registration failed" });
        setIsSubmitting(false);
        return;
      }

      // If backend returns a token (backwards-compatible), store and redirect
      if (data.token) {
        localStorage.setItem("token", data.token);
        setAlert({ type: "success", message: "Registration successful! Redirecting to dashboard..." });
        setTimeout(() => navigate("/login"), 1200);
        return;
      }

      // Otherwise, backend expects OTP verification
      if (data.msg && data.email) {
        setAlert({ type: "success", message: data.msg });
        openOtpModal(); // show OTP modal
        setIsSubmitting(false);
        return;
      }

      // fallback
      setAlert({ type: "success", message: data.msg || "Registration submitted. Please verify email." });
      openOtpModal();
    } catch (err: any) {
      console.error("Register error (frontend):", err);
      setAlert({ type: "error", message: "Unable to register. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------- OTP Modal Helpers -----------------
  const openOtpModal = () => {
    setOtpValue("");
    setOtpOpen(true);
    startResendCooldown(30); // 30s cooldown for resend
  };

  const closeOtpModal = () => {
    setOtpOpen(false);
    setOtpValue("");
    setResendCooldown(0);
    if (resendTimerRef.current) {
      window.clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
  };

  const startResendCooldown = (seconds: number) => {
    setResendCooldown(seconds);
    if (resendTimerRef.current) {
      window.clearInterval(resendTimerRef.current);
    }
    resendTimerRef.current = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) {
            window.clearInterval(resendTimerRef.current);
            resendTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        window.clearInterval(resendTimerRef.current);
        resendTimerRef.current = null;
      }
    };
  }, []);

  // ----------------- Verify OTP -----------------
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpLoading(true);
    setAlert(null);

    if (!otpValue || otpValue.trim().length < 6) {
      setAlert({ type: "error", message: "Please enter the 6-digit OTP." });
      setOtpLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAlert({ type: "error", message: data.msg || "OTP verification failed" });
        setOtpLoading(false);
        return;
      }

      // success: backend returns token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setAlert({ type: "success", message: data.msg || "Email verified successfully!" });
      closeOtpModal();
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      console.error("Verify OTP error:", err);
      setAlert({ type: "error", message: "Unable to verify OTP. Try again later." });
    } finally {
      setOtpLoading(false);
    }
  };

  // ----------------- Resend OTP -----------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    setAlert(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlert({ type: "error", message: data.msg || "Failed to resend OTP" });
        setOtpLoading(false);
        return;
      }

      setAlert({ type: "success", message: data.msg || "OTP resent successfully" });
      startResendCooldown(30);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setAlert({ type: "error", message: "Unable to resend OTP. Try again later." });
    } finally {
      setOtpLoading(false);
    }
  };

  // ----------------- Render -----------------
  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-start justify-center pt-20 md:pt-32 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-green-100">
        {/* decorative floating shapes - hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute top-12 left-10 w-36 h-36 bg-primary-200/30 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-12 right-10 w-44 h-44 bg-earth-200/30 rounded-full blur-2xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl space-y-6 md:space-y-8 relative z-10"
        >
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg md:shadow-2xl border border-gray-100 mx-auto w-full">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
                className="mx-auto h-12 w-12 md:h-16 md:w-16 bg-primary-600 rounded-full flex items-center justify-center mb-3 md:mb-4"
              >
                <Sprout className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Join AgriCorus</h2>
              <p className="text-sm md:text-base text-gray-600">Start your agricultural investment journey</p>
            </div>

            {/* Alerts */}
            {alert && (
              <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-4">
                {/* Name Field */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`input-field pl-10 text-sm md:text-base ${formErrors.name ? "border-red-500" : ""}`}
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`input-field pl-10 text-sm md:text-base ${formErrors.email ? "border-red-500" : ""}`}
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone Field */}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className={`input-field pl-10 text-sm md:text-base ${formErrors.phone ? "border-red-500" : ""}`}
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`input-field pl-10 pr-10 text-sm md:text-base ${formErrors.password ? "border-red-500" : ""}`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? 
                      <EyeOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" /> : 
                      <Eye className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    }
                  </button>
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className={`input-field pl-10 pr-10 text-sm md:text-base ${formErrors.confirmPassword ? "border-red-500" : ""}`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                  >
                    {showConfirmPassword ? 
                      <EyeOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" /> : 
                      <Eye className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                    }
                  </button>
                  {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* Role Selection - Mobile Optimized */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${formErrors.role ? "text-red-500" : "text-gray-700"}`}>
                  Select your role
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                  {["landowner", "farmer", "investor"].map((r) => (
                    <label key={r} className="flex items-center space-x-2 py-1">
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={formData.role === r}
                        onChange={handleRadioChange}
                        className="form-radio text-primary-600 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 capitalize">{r}</span>
                    </label>
                  ))}
                </div>
                {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
              </div>

              <div className="space-y-3">
                <button 
                  type="submit" 
                  className="btn-primary w-full text-sm md:text-base py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 text-xs md:text-sm">Or continue with</span>
                  </div>
                </div>

                <GoogleButton text="Sign up with Google" />

                <p className="text-xs md:text-sm text-gray-600 text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* OTP Modal - Mobile Responsive */}
      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 md:p-6 mx-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Verify your email</h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-lg"
                onClick={() => {
                  closeOtpModal();
                }}
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit OTP sent to <b>{formData.email}</b>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                <input
                  type="text"
                  name="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                  className="input-field pl-10 text-center text-lg tracking-widest text-sm md:text-base"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <button
                  type="submit"
                  className="btn-primary flex-1 text-sm md:text-base py-3 order-2 sm:order-1"
                  disabled={otpLoading}
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  className="btn-ghost flex items-center justify-center space-x-2 px-4 py-2 border rounded text-sm order-1 sm:order-2"
                  onClick={handleResendOtp}
                  disabled={otpLoading || resendCooldown > 0}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}</span>
                </button>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-gray-500 hover:text-primary-600"
                  onClick={() => {
                    closeOtpModal();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default RegisterPage;