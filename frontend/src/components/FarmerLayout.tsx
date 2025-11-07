// src/components/FarmerLayout.tsx
import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  TrendingUp,
  MapPin,
  Home,
  Shield,
  FileText,
  CreditCard,
  AlertTriangle,
  Menu,
  X,
  UserCircle,
  LogOut,
  ChevronDown,
  ShoppingBag
} from "lucide-react";

const FarmerLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop default: open
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile overlay state
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------- NAVIGATION ITEMS --------------------
  const navigationItems = [
    { label: "Home", icon: Home, href: "/farmerdashboard" },

    {
      label: "Manage Profile",
      icon: UserCircle,
      href: "#",
      children: [
        { label: "Verify Identity", icon: UserCircle, href: "/farmer/kyc/verify" },
        { label: "View Profile", icon: UserCircle, href: "/farmer/profile" },
        { label: "View KYC Status", icon: UserCircle, href: "/farmer/kyc/status" },
      ],
    },

    { label: "View Lands", icon: MapPin, href: "/lands/farmer" },

    {
      label: "Crowdfunding",
      icon: TrendingUp,
      href: "#",
      children: [
        { label: "Add Projects", icon: UserCircle, href: "/farmer/projects/add" },
        { label: "View Projects", icon: UserCircle, href: "/farmer/projects" },
        { label: "Approved Projects", icon: UserCircle, href: "/approved-projects" },
      ],
    },

    {
      label: "Lease History",
      icon: FileText,
      href: "#",
      children: [
        { label: "Accepted Leases", icon: UserCircle, href: "/farmer/leases/accepted" },
        { label: "Cancelled Leases", icon: UserCircle, href: "/farmer/leases/cancelled" },
        { label: "Active Leases", icon: UserCircle, href: "/farmer/leases/active" },
      ],
    },

    {
  label: "Crowdfunding History",
  icon: FileText,
  href: "#",
  children: [
    { label: "Completed Projects", icon: UserCircle, href: "/closed-projects" },
    { label: "Funded Projects", icon: UserCircle, href: "/ongoing-projects" },
  ],
},
    {
  label: 'Disputes History',
  icon: AlertTriangle,
  href: '/disputes/my',
},
  ];

  // -------------------- HANDLERS --------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => location.pathname.startsWith(href);

  // -------------------- RENDER NAV ITEMS --------------------
  const renderNavItems = (items: typeof navigationItems, isMobile = false) =>
    items.map((item, idx) => {
      const hasChildren = !!item.children;
      const isOpen = openMenus[item.label];
      const active = isActive(item.href);

      // Only render when sidebar is open
      if (!isSidebarOpen) return null;

      return (
        <div key={idx}>
          {/* Parent Item */}
          <div
            className={`flex items-center justify-between px-4 py-2 rounded-md cursor-pointer transition ${
              active
                ? "bg-gray-200 text-green-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => {
              if (hasChildren) {
                toggleMenu(item.label);
              } else if (isMobile) {
                setIsMobileOpen(false);
              }
            }}
          >
            <Link
              to={item.href}
              className="flex items-center gap-3 flex-1 text-sm font-medium"
              onClick={() => isMobile && !hasChildren && setIsMobileOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>

            {hasChildren && (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            )}
          </div>

          {/* Children */}
          {hasChildren && isOpen && (
            <div className="ml-8 flex flex-col space-y-1">
              {item.children.map((child, cidx) => {
                const childActive = isActive(child.href);
                return (
                  <Link
                    key={cidx}
                    to={child.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
                      childActive
                        ? "bg-gray-200 text-green-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsMobileOpen(false)}
                  >
                    <child.icon className="w-4 h-4" />
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    });

  // -------------------- LAYOUT --------------------
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div
        className={`hidden md:flex flex-col bg-white border-r transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-16"
        } relative`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <Shield className="w-6 h-6 text-green-700" />
          {isSidebarOpen && <span className="text-xl font-bold">AgriCorus</span>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="mt-4 flex-1 flex flex-col space-y-1">
          {renderNavItems(navigationItems)}
        </nav>

        {/* Logout at bottom */}
        {isSidebarOpen && (
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-100 rounded-md transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
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

        <div className="flex flex-col h-full">
          <nav className="mt-4 flex-1 flex flex-col space-y-1 overflow-y-auto">
            {renderNavItems(navigationItems, true)}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-100 rounded-md transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
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
