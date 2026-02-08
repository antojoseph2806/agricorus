import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import GoogleButton from "../components/GoogleButton";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import AlertMessage from "../components/AlertMessage";
import Navbar from "../components/Navbar";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const [alert, setAlert] = useState<
    { type: "success" | "error" | "warning"; message: string } | null
  >(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("https://agricorus.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        setAlert({ type: "success", message: "Login successful! Redirecting..." });

        setTimeout(() => {
          switch (user.role) {
            case "farmer":
              navigate("/farmerdashboard");
              break;
            case "landowner":
              navigate("/landownerdashboard");
              break;
            case "investor":
              navigate("/investordashboard");
              break;
            case "admin":
              navigate("/admindashboard");
              break;
            default:
              setAlert({
                type: "warning",
                message: "Invalid role. Please contact support.",
              });
          }
        }, 1500);
      } else {
        setAlert({ type: "error", message: data.msg || "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-emerald-200/30 to-green-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-green-200/30 to-emerald-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, -20, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-100/20 to-green-100/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg relative"
              >
                <Sprout className="h-10 w-10 text-white" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </motion.div>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2"
              >
                Welcome Back
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                Sign in to your AgriCorus account
              </motion.p>
            </div>

            {alert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertMessage
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
                />
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember me + Forgot password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="relative my-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              {/* Google Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <GoogleButton text="Sign in with Google" />
              </motion.div>

              {/* Sign up link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center text-gray-600 mt-6"
              >
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Sign up now
                </Link>
              </motion.p>
            </form>
          </div>

          {/* Bottom decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              Trusted by thousands of farmers, landowners, and investors
            </p>
            <div className="flex items-center justify-center mt-3 space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-2">+10,000 users</span>
            </div>
          </motion.div>
        </motion.div>

        {showForgotModal && (
          <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
        )}
      </div>
    </>
  );
};

export default LoginPage;
