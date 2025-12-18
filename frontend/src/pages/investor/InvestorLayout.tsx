import React, { useState } from "react";
import {
  Shield,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  FileText,
  Home,
  ShoppingBag,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Type definition for navigation items
interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  children?: NavItem[];
}

// Props type for the Sidebar component
interface SidebarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

// ----- Sidebar Component -----
const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isMobile,
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
        { label: "Verify Identity", icon: UserCircle, href: "/investor/verify-identity" },
        { label: "View Profile", icon: UserCircle, href: "/investor/profile" },
        { label: "KYC Status", icon: UserCircle, href: "/investor/kyc-status" },
      ],
    },
    { label: "View Projects", icon: TrendingUp, href: "/projects" },
    { label: "Investment History", icon: DollarSign, href: "/investments/history" },
    {
  label: "UPI/Bank Management",
  icon: CreditCard,
  href: "#",
  children: [
    { label: "Manage UPI", icon: UserCircle, href: "/investor/upi/manage" },
    { label: "Manage Bank Card", icon: UserCircle, href: "/investor/bank/manage" },
  ],
},

    {
      label: "Investment Payouts",
      icon: UserCircle,
      href: "#",
      children: [
        { label: "Request For Investment Return", icon: UserCircle, href: "/investor/return-request" },
        { label: "Payment History", icon: UserCircle, href: "/investor/return-requests-history" },
      ],
    },
    {
      label: 'Marketplace',
      icon: ShoppingBag,
      href: '#',
      children: [
        { label: 'Browse Products', icon: ShoppingBag, href: '/marketplace' },
        { label: 'My Cart', icon: ShoppingBag, href: '/cart' },
        { label: 'Order History', icon: FileText, href: '/orders' },
      ],
    },
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

  return (
    <div
      className={`flex flex-col h-full bg-white shadow-xl border-r transition-all duration-300 ${
        isMobile ? "w-64" : isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center h-16 border-b px-4 relative">
        <div
          className={`flex items-center transition-opacity duration-300 ${
            isSidebarOpen || isMobile ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 ml-2">AgriCorus</span>
        </div>
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isSidebarOpen ? "-right-4" : "right-4"
            } p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition`}
          >
            {isSidebarOpen ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 -rotate-90" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <div key={index}>
            {item.children ? (
              <>
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {(isSidebarOpen || isMobile) && item.label}
                  </div>
                  {(isSidebarOpen || isMobile) && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {(isSidebarOpen || isMobile) && openDropdown === item.label && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child, idx) => (
                      <Link
                        key={idx}
                        to={child.href}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <child.icon className="w-4 h-4 mr-2" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <item.icon className="w-4 h-4" />
                {(isSidebarOpen || isMobile) && item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
        >
          <LogOut className="w-4 h-4" />
          {(isSidebarOpen || isMobile) && "Logout"}
        </button>
      </div>
    </div>
  );
};

// ----- Reusable Layout Wrapper -----
export const InvestorLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          isMobile={false}
        />
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b shadow z-40 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgriCorus</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-700 hover:text-emerald-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Overlay Sidebar */}
        <div
          className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full relative">
            <Sidebar
              isSidebarOpen={true}
              onToggleSidebar={toggleSidebar}
              isMobile={true}
            />
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area with Top Margin for Mobile Header */}
        <main className="p-4 lg:p-8 mt-16 lg:mt-0">{children}</main>
      </div>
    </div>
  );
};
