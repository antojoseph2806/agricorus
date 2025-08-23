import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import RolePickerModal from './RolePickerModal';

interface GoogleUserPayload {
  email: string;
  sub: string;
}

interface GoogleButtonProps {
  text?: string;
  role?: string; // optional pre-selected role
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ text = 'Continue with Google', role }) => {
  const [newUserData, setNewUserData] = useState<{ email: string; googleId: string } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'landowner':
        navigate('/landownerdashboard');
        break;
      case 'farmer':
        navigate('/farmerdashboard');
        break;
      case 'investor':
        navigate('/investordashboard');
        break;
      case 'admin':
        navigate('/admindashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    try {
      if (!credentialResponse.credential) {
        setError('No credential received from Google');
        return;
      }

      const decoded: GoogleUserPayload = jwtDecode(credentialResponse.credential);

      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: credentialResponse.credential,
          role, // send role if pre-selected
        }),
      });

      const data = await res.json();

      if (res.ok && data.newUser) {
        // New user: ask for role & phone
        setNewUserData({
          email: decoded.email,
          googleId: decoded.sub,
        });
        setShowRoleModal(true);
      } else if (res.ok && data.token && data.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        redirectByRole(data.role);
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Google login failed');
    }
  };

  const handleRoleSelect = async (selectedRole: string, phone: string) => {
    if (!newUserData) return;

    try {
      const res = await fetch('/api/auth/google/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserData.email,
          googleId: newUserData.googleId,
          role: selectedRole,
          phone,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.role) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setShowRoleModal(false);
        redirectByRole(data.role);
      } else {
        setError(data.msg || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => setError('Google Login Failed')}
      />

      {showRoleModal && <RolePickerModal onSubmit={handleRoleSelect} />}
    </div>
  );
};

export default GoogleButton;
