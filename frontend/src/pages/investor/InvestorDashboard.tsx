import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  UserCircle,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  children?: NavItem[];
}

interface SidebarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen = true,
  onToggleSidebar = () => {},
  isMobile = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const navigationItems: NavItem[] = [
    { label: "Home", icon: Home, href: "/investordashboard" },
    {
      label: "Manage Profile",
      icon: UserCircle,
      href: "#",
      children: [
        { label: "Verify Identity", icon: UserCircle, href: "/kyc/add" },
        { label: "View Profile", icon: UserCircle, href: "/profile/view" },
        { label: "KYC Status", icon: UserCircle, href: "/profile/kyc-status" },
      ],
    },
    { label: "View Projects", icon: TrendingUp, href: "/projects" },
    {
      label: "Investment History",
      icon: DollarSign,
      href: "/payments",
      children: [
        { label: "Ongoing Investments", icon: UserCircle, href: "/payments/ongoing" },
        { label: "Completed Investments", icon: UserCircle, href: "/payments/completed" },
      ],
    },
    {
      label: "Dispute Management",
      icon: AlertTriangle,
      href: "#",
      children: [
        { label: "Ongoing disputes", icon: UserCircle, href: "/disputes/ongoing" },
        { label: "Rejected disputes", icon: UserCircle, href: "/disputes/rejected" },
        { label: "Closed disputes", icon: UserCircle, href: "/disputes/closed" },
      ],
    },
    {
      label: "Apply For ROI",
      icon: AlertTriangle,
      href: "#",
      children: [
        { label: "Successful ROI History", icon: UserCircle, href: "/roi/successful" },
        { label: "Cancelled ROI History", icon: UserCircle, href: "/roi/cancelled" },
      ],
    },
    { label: "ROI Reports", icon: FileText, href: "/reports" },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn("Backend logout failed.");
      }
    }
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const handleNavigation = (href: string) => {
    if (href !== "#") navigate(href);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white shadow-xl border-r transition-all duration-300 ${
        isMobile ? "w-64" : isSidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Logo & toggle */}
      <div className="flex items-center h-16 border-b px-4 relative justify-between">
        {(isSidebarOpen || isMobile) && (
          <div className="flex items-center transition-opacity duration-300">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 ml-2">AgriCorus</span>
          </div>
        )}

        {/* Toggle Button */}
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Nav Items */}
      {(isSidebarOpen || isMobile) && (
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(child.href)}
                          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition w-full text-left"
                        >
                          <child.icon className="w-4 h-4 mr-2" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-left"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Logout */}
      {(isSidebarOpen || isMobile) && (
        <div className="px-4 py-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
