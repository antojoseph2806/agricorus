import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, X } from 'lucide-react';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);

  // OTP expiry countdown (1 minute)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Resend OTP countdown (2 minutes)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Auto-reset to step 1 when OTP expires
  useEffect(() => {
    if (otpCountdown === 0 && step === 2) {
      setError("OTP has expired. Please request a new one.");
      setTimeout(() => {
        setStep(1);
        setOtp("");
        setError("");
      }, 3000);
    }
  }, [otpCountdown, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendOtp = async () => {
    if (!phone) {
      setError("Phone number is required");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number starting with 6-9");
      return;
    }

    if (resendCountdown > 0) {
      setError(`Please wait ${formatTime(resendCountdown)} before requesting another OTP`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch('https://agricorus.duckdns.org/api/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('OTP sent successfully');
        setStep(2);
        setOtpCountdown(60); // 1 minute countdown for OTP expiry
        setResendCountdown(120); // 2 minutes countdown for resend
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (otpCountdown === 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch('https://agricorus.duckdns.org/api/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('OTP verified successfully');
        setStep(3);
        setOtpCountdown(0); // Clear countdown
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch('https://agricorus.duckdns.org/api/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            {step === 1 && "Enter your phone number to receive an OTP"}
            {step === 2 && "Enter the OTP sent to your phone"}
            {step === 3 && "Create a new password for your account"}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={phone}
                onChange={(e) => {
                  // Only allow numbers and limit to 10 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                disabled={loading}
                maxLength={10}
                pattern="[6-9][0-9]{9}"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a 10-digit number starting with 6, 7, 8, or 9
              </p>
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || resendCountdown > 0}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Sending..." : resendCountdown > 0 ? `Wait ${formatTime(resendCountdown)}` : "Send OTP"}
            </button>
            {resendCountdown > 0 && (
              <p className="text-xs text-gray-500 text-center">
                You can request another OTP in {formatTime(resendCountdown)}
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
                {otpCountdown > 0 && (
                  <span className="text-emerald-600 ml-2">
                    (Expires in {formatTime(otpCountdown)})
                  </span>
                )}
                {otpCountdown === 0 && (
                  <span className="text-red-600 ml-2">(Expired)</span>
                )}
              </label>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-2xl tracking-widest transition"
                disabled={loading || otpCountdown === 0}
              />
            </div>
            
            {/* Resend OTP Button */}
            <div className="text-center">
              <button
                onClick={sendOtp}
                disabled={loading || resendCountdown > 0}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCountdown > 0 
                  ? `Resend OTP in ${formatTime(resendCountdown)}`
                  : "Resend OTP"
                }
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep(1);
                  setOtpCountdown(0);
                  setOtp("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={verifyOtp}
                disabled={loading || otpCountdown === 0 || otp.length !== 6}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={resetPassword}
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
