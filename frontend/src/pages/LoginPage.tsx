import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, Mail, Lock } from "lucide-react";
import GoogleButton from "../components/GoogleButton";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import AlertMessage from "../components/AlertMessage";
import Navbar from "../components/Navbar";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const response = await fetch("http://localhost:5000/api/auth/login", {
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
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background animations - hidden on mobile for performance */}
        <div className="absolute inset-0 z-0 hidden sm:block">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-200/30 rounded-full blur-xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md space-y-6 md:space-y-8 relative z-10"
        >
          <div className="card bg-white shadow-lg md:shadow-xl rounded-xl md:rounded-2xl p-6 md:p-8 mx-auto w-full">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto h-12 w-12 md:h-16 md:w-16 bg-green-600 rounded-full flex items-center justify-center mb-3 md:mb-4"
              >
                <Sprout className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-sm md:text-base text-gray-600">Sign in to your AgriCorus account</p>
            </div>

            {alert && (
              <AlertMessage
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}

            <form className="mt-4 md:mt-6 space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3 md:space-y-4">
                {/* Email Field */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field pl-10 w-full text-sm md:text-base py-3"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="input-field pl-10 w-full text-sm md:text-base py-3"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Remember me + Forgot password - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="font-medium text-green-600 hover:text-green-500 text-sm md:text-base"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full mt-2 md:mt-4 py-3 text-sm md:text-base"
              >
                Sign In
              </button>

              {/* Divider */}
              <div className="relative mt-4 md:mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 text-xs md:text-sm">
                    Or continue with
                  </span>
                </div>
              </div>

              <GoogleButton text="Sign in with Google" />

              <p className="text-xs md:text-sm text-center text-gray-600 mt-4">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </motion.div>

        {showForgotModal && (
          <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
        )}
      </div>
    </>
  );
};

export default LoginPage;