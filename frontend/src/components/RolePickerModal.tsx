import React, { useState } from 'react';

interface Props {
  onSubmit: (role: string, phone: string) => void;
}

const RolePickerModal: React.FC<Props> = ({ onSubmit }) => {
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!role || !phone) {
      setError('Please select a role and enter phone number.');
      return;
    }
    setError('');
    onSubmit(role, phone);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 space-y-4">
        <h2 className="text-lg font-semibold">Complete Registration</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Role</option>
          <option value="farmer">Farmer</option>
          <option value="landowner">Landowner</option>
          <option value="investor">Investor</option>
        </select>

        <input
          type="tel"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RolePickerModal;
