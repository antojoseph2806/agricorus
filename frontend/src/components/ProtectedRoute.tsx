import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/forbidden" replace />; // 🔁 better UX
  }

  return element;
};

export default ProtectedRoute;
