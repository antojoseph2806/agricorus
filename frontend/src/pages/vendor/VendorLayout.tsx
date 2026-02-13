import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle,
  Package,
  ShoppingCart,
  Wallet,
  Star,
  MessageSquare,
  ShieldCheck,
  Settings,
  Store,
  Bell,
  BarChart3,
  TrendingUp,
  FileText,
  Calendar,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

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
const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onToggleSidebar, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/vendor/dashboard' },
    {
      label: 'Products',
      icon: Package,
      href: '#',
      children: [
        { label: 'Add Product', icon: Store, href: '/vendor/products/add' },
        { label: 'Manage Products', icon: Package, href: '/vendor/products' },
      ],
    },
    { label: 'Inventory', icon: Settings, href: '/vendor/inventory' },
    { label: 'Orders', icon: ShoppingCart, href: '/vendor/orders' },
    {
      label: 'Sales Analytics',
      icon: BarChart3,
      href: '#',
      children: [
        { label: 'Sales Dashboard', icon: TrendingUp, href: '/vendor/analytics/dashboard' },
        { label: 'Monthly Reports', icon: Calendar, href: '/vendor/analytics/monthly' },
        { label: 'Custom Reports', icon: FileText, href: '/vendor/analytics/reports' },
      ],
    },
    { label: 'Notifications', icon: Bell, href: '/vendor/notifications' },
    { label: 'Payments', icon: Wallet, href: '/vendor/payments' },
    {
      label: 'Support',
      icon: MessageSquare,
      href: '#',
      children: [
        { label: 'Customer Queries', icon: MessageSquare, href: '/vendor/support/queries' },
      ],
    },
    { label: 'Ratings & Feedback', icon: Star, href: '/vendor/feedback' },
    { label: 'Profile & KYC', icon: ShieldCheck, href: '/vendor/profile' },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('Backend logout failed.');
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('vendorName');
    localStorage.removeItem('userName');
    navigate('/vendor/login');
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleNavClick = () => {
    if (isMobile) {
      onToggleSidebar();
    }
  };

  const isActive = (href: string) => {
    if (href === '#') return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const isChildActive = (children?: NavItem[]) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.href || location.pathname.startsWith(child.href + '/'));
  };

  return (
    <div className={`flex flex-col h-full bg-white shadow-xl border-r transition-all duration-300 ${
        isMobile ? "w-64" : isSidebarOpen ? "w-64" : "w-20"
      }`}>
      <div className="flex items-center h-16 border-b px-4 relative">
        <div className={`flex items-center transition-opacity duration-300 ${
            isSidebarOpen || isMobile ? "opacity-100" : "opacity-0"
          }`}>
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
            } p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition z-50`}
          >
            {isSidebarOpen ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 -rotate-90" />
            )}
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const active = isActive(item.href) || isChildActive(item.children);
          
          return (
            <div key={index}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                       <item.icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-gray-700'} transition-colors`} />
                      {(isSidebarOpen || isMobile) && (
                        <span>{item.label}</span>
                      )}
                    </div>
                    {(isSidebarOpen || isMobile) && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        } ${active ? 'text-emerald-600' : 'text-gray-400'}`}
                      />
                    )}
                  </button>
                  {(isSidebarOpen || isMobile) && openDropdown === item.label && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child, idx) => {
                        const childActive = location.pathname === child.href || location.pathname.startsWith(child.href + '/');
                        return (
                          <Link
                            key={idx}
                            to={child.href}
                            onClick={handleNavClick}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              childActive
                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <child.icon className={`w-4 h-4 ${childActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-gray-700'} transition-colors`} />
                  {(isSidebarOpen || isMobile) && (
                    <span>{item.label}</span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="px-4 py-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
        >
          <LogOut className="w-4 h-4" />
          {(isSidebarOpen || isMobile) && (
            <span>Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

// ----- User Profile Dropdown Component -----
const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [vendorName, setVendorName] = useState("Vendor");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("vendorName") || localStorage.getItem("userName");
    if (storedName) {
      setVendorName(storedName);
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn("Backend logout failed.");
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("vendorName");
    localStorage.removeItem("userName");
    navigate("/vendor/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition overflow-hidden border-2 border-emerald-200"
      >
        <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold">
          {vendorName.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{vendorName}</div>
            <div className="text-xs text-gray-500">Vendor Account</div>
          </div>
          <Link
            to="/vendor/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <UserCircle className="w-4 h-4" />
            View Profile
          </Link>
          <Link
            to="/vendor/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Settings className="w-4 h-4" />
            Edit Profile
          </Link>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ----- Reusable Layout Wrapper -----
const VendorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} isMobile={false} />
      </aside>

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
         <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b shadow z-40 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgriCorus</span>
          </div>
          <div className="flex items-center gap-3">
            <UserProfileDropdown />
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-700 hover:text-emerald-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="hidden lg:block fixed top-0 right-0 left-0 bg-white border-b shadow-sm z-30 h-16" style={{ marginLeft: isSidebarOpen ? '256px' : '80px' }}>
          <div className="h-full flex items-center justify-end px-6">
            <UserProfileDropdown />
          </div>
        </div>

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

        <main className="p-4 lg:p-8 mt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
