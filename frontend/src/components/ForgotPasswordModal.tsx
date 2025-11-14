import React, { useState } from 'react';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const sendOtp = async () => {
    const res = await fetch('http://localhost:5000/api/forgot-password/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('OTP sent successfully');
      setStep(2);
    } else {
      setMsg(data.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    const res = await fetch('http://localhost:5000/api/forgot-password/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('OTP verified');
      setStep(3);
    } else {
      setMsg(data.message || 'Invalid OTP');
    }
  };

  const resetPassword = async () => {
    const res = await fetch('http://localhost:5000/api/forgot-password/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Password reset successful!');
      setTimeout(onClose, 2000);
    } else {
      setMsg(data.message || 'Failed to reset password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Reset Password</h2>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field mb-4 w-full"
            />
            <button className="btn-primary w-full" onClick={sendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input-field mb-4 w-full"
            />
            <button className="btn-primary w-full" onClick={verifyOtp}>Verify OTP</button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field mb-4 w-full"
            />
            <button className="btn-primary w-full" onClick={resetPassword}>Reset Password</button>
          </>
        )}

        <p className="text-sm text-center text-gray-600 mt-4">{msg}</p>

        <button className="text-sm text-red-500 mt-4 w-full" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
