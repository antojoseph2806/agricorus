// src/components/FarmerLayout.tsx
import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  Shield,
  FileText,
  CreditCard,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

const FarmerLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop default: open
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile overlay state
  const navigate = useNavigate();

  const navigationItems = [
    { label: "Home", icon: Home, href: "/farmerdashboard" },
    { label: "Verify Identity", icon: Shield, href: "/kyc" },
    { label: "View Lands", icon: MapPin, href: "/lands/farmer" },
    { label: "Apply for Crowdfunding", icon: TrendingUp, href: "/crowdfunding" },
    { label: "Lease History", icon: FileText, href: "/agreements" },
    { label: "Payments", icon: CreditCard, href: "/payments" },
    { label: "Raise Dispute", icon: AlertTriangle, href: "/disputes" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div
        className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        } relative`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          {isSidebarOpen && <span className="text-xl font-bold">AgriCorus</span>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="mt-4 flex flex-col space-y-1">
          {navigationItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.href}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 mt-4 text-red-600 hover:bg-red-100 rounded transition"
          >
            <X className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </div>

      {/* Sidebar Mobile Overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r transition-transform duration-300 w-64 md:hidden
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <span className="text-xl font-bold">AgriCorus</span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-4 flex flex-col space-y-1">
          {navigationItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.href}
              onClick={() => setIsMobileOpen(false)} // close sidebar on mobile after click
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 mt-4 text-red-600 hover:bg-red-100 rounded transition"
          >
            <X className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar Mobile */}
        <div className="flex items-center justify-between px-4 h-16 bg-white border-b md:hidden">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold">AgriCorus</span>
        </div>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout;
