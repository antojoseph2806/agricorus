import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles: string[]; // ✅ now supports multiple roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return element;
};

export default ProtectedRoute;
