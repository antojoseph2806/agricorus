import { useNavigate } from 'react-router-dom';

export const logout = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      await fetch('https://agricorus.onrender.com/api/auth/logout', {
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
