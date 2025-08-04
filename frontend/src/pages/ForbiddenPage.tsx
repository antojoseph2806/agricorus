import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-[#f9f9f9] shadow-md border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <ShieldAlert className="text-[#16a34a] w-12 h-12" />
        </div>
        <h1 className="text-5xl font-bold text-[#16a34a]">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-2">Access Denied</h2>
        <p className="text-gray-600 mt-2 text-sm">
          You do not have permission to access this page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 bg-[#16a34a] text-white font-semibold rounded-md hover:bg-[#15803d] transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default ForbiddenPage;
