import React, { useState } from 'react';
import GoogleButton from './GoogleButton';

const GoogleLoginWithRole = () => {
  const [role, setRole] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  return (
    <div className="space-y-4">
      <select value={role} onChange={handleChange} className="input-field w-full">
        <option value="">Select Role</option>
        <option value="farmer">Farmer</option>
        <option value="landowner">Landowner</option>
        <option value="investor">Investor</option>
      </select>

      {/* Only render Google button if role is selected */}
      {role && <GoogleButton role={role} />}
    </div>
  );
};

export default GoogleLoginWithRole;
