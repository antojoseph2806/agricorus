// src/pages/SelectRolePage.tsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SelectRolePage = () => {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userId');
    const tempToken = localStorage.getItem('tempToken');

    if (!userId || !tempToken) return alert('Invalid session');

    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL || "https://agricorus.duckdns.org"}/api/auth/set-role`, {
        userId,
        role,
      });

      // Save final token
      localStorage.setItem('token', res.data.token);
      localStorage.removeItem('tempToken');
      localStorage.removeItem('userId');

      navigate(`/${res.data.role}/dashboard`);
    } catch (err) {
      console.error(err);
      alert('Role setting failed');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Select Your Role</h2>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full mb-4"
      >
        <option value="">-- Select Role --</option>
        <option value="farmer">Farmer</option>
        <option value="landowner">Landowner</option>
        <option value="investor">Investor</option>
        <option value="admin">Admin</option>
      </select>
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
};

export default SelectRolePage;
