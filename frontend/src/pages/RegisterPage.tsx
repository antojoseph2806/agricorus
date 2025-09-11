import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import GoogleButton from '../components/GoogleButton';
import AlertMessage from '../components/AlertMessage';

// ==================== VALIDATION FUNCTIONS ====================

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const domainParts = email.split('@')[1]?.split('.');
  return domainParts && domainParts.length <= 3;
};

const isValidPhone = (phone: string): boolean => {
  const sanitized = phone.replace(/^(\+91)?/, '');

  if (!/^[6-9]\d{9}$/.test(sanitized)) return false;

  const fakeNumbers = [
    '1234567890', '1111111111', '2222222222', '3333333333',
    '4444444444', '5555555555', '6666666666', '7777777777',
    '8888888888', '9999999999', '0000000000',
  ];

  return !fakeNumbers.includes(sanitized);
};

const isStrongPassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
};

// ==================== MAIN COMPONENT ====================

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Alert state instead of plain error string
  const [alert, setAlert] = useState<
    { type: 'success' | 'error' | 'warning'; message: string } | null
  >(null);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const { email, phone, password, confirmPassword, role } = formData;
    const sanitizedPhone = phone.replace(/^(\+91)?/, '');

    if (!role) {
      setAlert({ type: 'warning', message: 'Please select a role' });
      return;
    }

    if (!isValidEmail(email)) {
      setAlert({
        type: 'error',
        message: 'Enter a valid email with max 2 subdomains (e.g., name@sub.domain.com)',
      });
      return;
    }

    if (!isValidPhone(sanitizedPhone)) {
      setAlert({
        type: 'error',
        message: 'Enter a valid 10-digit Indian phone number (not fake or repeated)',
      });
      return;
    }

    if (!isStrongPassword(password)) {
      setAlert({
        type: 'error',
        message: 'Password must be 8+ characters, with uppercase, lowercase, number & special character',
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: sanitizedPhone })
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({ type: 'error', message: data.msg || 'Registration failed' });
        return;
      }

      localStorage.setItem('token', data.token);
      setAlert({ type: 'success', message: 'Registration successful! Redirecting to login...' });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setAlert({ type: 'error', message: 'Server error. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-20 left-10 w-32 h-32 bg-primary-200/30 rounded-full blur-xl" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-20 right-10 w-40 h-40 bg-earth-200/30 rounded-full blur-xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-md w-full space-y-8 relative z-10">
        <div className="card">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <Sprout className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join AgriCorus</h2>
            <p className="text-gray-600">Start your agricultural investment journey</p>
          </div>

          {/* ✅ Professional Alert */}
          {alert && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="input-field pl-10"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">Select your role</label>
                <div className="flex space-x-4">
                  {['landowner', 'farmer', 'investor'].map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formData.role === role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="form-radio text-primary-600"
                      />
                      <span className="text-gray-700 capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              <button type="submit" className="btn-primary w-full">Create Account</button>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
              <GoogleButton text="Sign up with Google" />
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }} className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;