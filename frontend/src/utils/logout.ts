import { useNavigate } from 'react-router-dom';

export const logout = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.warn('Server logout failed.');
    }
  }

  localStorage.removeItem('token');
  window.location.href = '/'; // or navigate('/login') if using in a component
};
