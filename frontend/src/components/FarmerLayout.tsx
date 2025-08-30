// src/components/FarmerLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import FarmerNavbar from "./FarmerNavbar";

const FarmerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FarmerNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default FarmerLayout;
