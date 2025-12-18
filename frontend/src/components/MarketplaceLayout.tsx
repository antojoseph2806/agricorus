import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout as LandownerLayout } from '../pages/landowner/LandownerDashboard';
import FarmerLayout from './FarmerLayout';
import { InvestorLayout } from '../pages/investor/InvestorLayout';

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token) {
      // Allow public access to marketplace
      setLoading(false);
      return;
    }
    
    setRole(userRole);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Render appropriate layout based on role
  switch (role) {
    case 'landowner':
      return <LandownerLayout>{children}</LandownerLayout>;
    case 'farmer':
      return <FarmerLayout>{children}</FarmerLayout>;
    case 'investor':
      return <InvestorLayout>{children}</InvestorLayout>;
    default:
      // For public access or unknown roles, render without sidebar
      return <div className="min-h-screen bg-gray-50">{children}</div>;
  }
};

export default MarketplaceLayout;