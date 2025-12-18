import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../pages/landowner/LandownerDashboard';

interface LandownerLayoutWrapperProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const LandownerLayoutWrapper: React.FC<LandownerLayoutWrapperProps> = ({ 
  children, 
  allowedRoles = ['landowner'] 
}) => {
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Don't redirect, just don't show layout
      return;
    }
  }, [allowedRoles]);

  // If user is landowner, wrap with layout
  if (role === 'landowner') {
    return <Layout>{children}</Layout>;
  }

  // Otherwise, render without layout (for other roles)
  return <>{children}</>;
};

export default LandownerLayoutWrapper;

