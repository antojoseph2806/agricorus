import React, { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  ShoppingCart,
  Truck,
  Wallet,
  Star,
  MessageSquare,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Store,
  Bell,
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  PieChart
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../../components/vendor/NotificationBell";

/* ---------- Types ---------- */
interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

/* ---------- Sidebar ---------- */
const VendorSidebar = ({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/vendor/dashboard",
    },
    {
      label: "Products",
      icon: Package,
      children: [
        { label: "Add Product", icon: Store, href: "/vendor/products/add" },
        { label: "Manage Products", icon: Package, href: "/vendor/products" },
        { label: "Compliance Documents", icon: ClipboardCheck, href: "/vendor/products/compliance" },
      ],
    },
    {
      label: "Inventory",
      icon: Settings,
      href: "/vendor/inventory",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/vendor/orders",
    },
    {
      label: "Sales Analytics",
      icon: BarChart3,
      children: [
        { label: "Sales Dashboard", icon: TrendingUp, href: "/vendor/analytics/dashboard" },
        { label: "Monthly Reports", icon: Calendar, href: "/vendor/analytics/monthly" },
        { label: "Product Performance", icon: PieChart, href: "/vendor/analytics/products" },
        { label: "Custom Reports", icon: FileText, href: "/vendor/analytics/reports" },
        { label: "Download Center", icon: Download, href: "/vendor/analytics/downloads" },
      ],
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/vendor/notifications",
    },
    {
      label: "Payments",
      icon: Wallet,
      href: "/vendor/payments",
    },
    {
      label: "Support",
      icon: MessageSquare,
      children: [
        { label: "Customer Queries", icon: MessageSquare, href: "/vendor/support/queries" },
        { label: "Warranty / Service", icon: ShieldCheck, href: "/vendor/support/warranty" },
      ],
    },
    {
      label: "Ratings & Feedback",
      icon: Star,
      href: "/vendor/feedback",
    },
    {
      label: "Profile & KYC",
      icon: ShieldCheck,
      href: "/vendor/profile",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/vendor/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r shadow-md transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-2">
          <Store className="w-7 h-7 text-green-600" />
          {isOpen && (
            <span className="text-lg font-bold text-gray-800">
              Vendor Panel
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <button onClick={toggleSidebar}>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isOpen ? "rotate-90" : "-rotate-90"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item, index) =>
          item.children ? (
            <div key={index}>
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === item.label ? null : item.label)
                }
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-50"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-green-600" />
                  {isOpen && <span>{item.label}</span>}
                </div>
                {isOpen && (
                  <ChevronDown
                    className={`w-4 h-4 ${
                      openDropdown === item.label ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {isOpen && openDropdown === item.label && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child, idx) => (
                    <Link
                      key={idx}
                      to={child.href!}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-green-100"
                    >
                      <child.icon className="w-4 h-4" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={index}
              to={item.href!}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50"
            >
              <item.icon className="w-5 h-5 text-green-600" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        )}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 w-full p-3 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

/* ---------- Layout Wrapper ---------- */
const VendorLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <VendorSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main
        className={`flex-1 p-6 transition-all ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default VendorLayout;
