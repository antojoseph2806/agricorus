import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Menu,
  X,
  Shield,
  FileText,
  AlertTriangle,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
  Server,
  Cloud,
  Database,
  Settings,
  BarChart3,
  ShieldCheck,
  User,
  UserCircle,
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
    { 
      label: 'Dashboard', 
      icon: BarChart3, 
      href: '/admindashboard' 
    },
    {
      label: "Manage Users",
      icon: Users,
      href: "/admin/users",
      children: [
        { label: "Landowners", icon: Server, href: "/admin/users/landowners" },
        { label: "Farmers", icon: Cloud, href: "/admin/users/farmers" },
        { label: "Investors", icon: Database, href: "/admin/users/investors" },
      ],
    },
    {
      label: 'Manage Lands',
      icon: MapPin,
      href: '/admin/lands',
      children: [
        { label: 'View All Lands', icon: FileText, href: '/admin/lands/all' },
        { label: 'View Pending Lands', icon: AlertCircle, href: '/admin/lands/pending' },
        { label: 'View Approved Lands', icon: CheckCircle, href: '/admin/lands/approved' },
        { label: 'View Rejected Lands', icon: XCircle, href: '/admin/lands/rejected' },
      ],
    },
    {
      label: "Manage Leases",
      icon: Settings,
      href: "/admin/leases",
      children: [
        { label: "View All Leases", icon: FileText, href: "/admin/leases" },
      ],
    },
    { 
      label: 'Manage Projects', 
      icon: TrendingUp, 
      href: '/admin/manage-projects' 
    },
    {
      label: "Manage Investments",
      icon: DollarSign,
      href: "/admin/manage-investments"
    },
    {
      label: 'Handle Disputes',
      icon: AlertTriangle,
      href: '#',
      children: [
        { label: 'Raised by Landowner', icon: FileText, href: '/admin/landowner/disputes' },
         { label: 'Raised by Farmer', icon: FileText, href: '/admin/farmer/disputes' },
      ],
    },
    {
      label: 'Manage Payments',
      icon: DollarSign,
      href: '#',
      children: [
        { label: "Investment Payouts", icon: FileText, href: "/admin/return-requests" },
        { label: 'Lease Payouts', icon: AlertCircle, href: '/admin/payment-requests' },
      ],
    },
    {
      label: 'Vendor KYC',
      icon: ShieldCheck,
      href: '/admin/vendor-kyc',
      children: [
        { label: 'KYC Requests', icon: FileText, href: '/admin/vendor-kyc' },
        { label: 'Verified Vendors', icon: CheckCircle, href: '/admin/verified-vendors' },
      ],
    },
    {
      label: 'User KYC',
      icon: Shield,
      href: '/admin/user-kyc',
      children: [
        { label: 'Farmer KYC', icon: Users, href: '/admin/user-kyc/farmers' },
        { label: 'Landowner KYC', icon: MapPin, href: '/admin/user-kyc/landowners' },
        { label: 'Investor KYC', icon: DollarSign, href: '/admin/user-kyc/investors' },
        { label: 'All KYC Requests', icon: FileText, href: '/admin/user-kyc/all' },
      ],
    },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('https://agricorus.duckdns.org/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('Backend logout failed.');
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleNavClick = () => {
    // Close mobile sidebar when navigation item is clicked
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
      {/* Header */}
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
      
      {/* Navigation */}
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
      
      {/* Logout Button */}
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
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
    const fetchProfileImage = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        const response = await fetch("https://agricorus.duckdns.org/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.profileImage) {
          const imageUrl = data.profileImage.startsWith('http') 
            ? data.profileImage 
            : `https://agricorus.duckdns.org${data.profileImage}`;
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };

    fetchProfileImage();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch("https://agricorus.duckdns.org/api/auth/logout", {
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition overflow-hidden border-2 border-emerald-200"
      >
        {profileImage ? (
          <img 
            src={profileImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <Link
            to="/admin/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <UserCircle className="w-4 h-4" />
            View Profile
          </Link>
          <Link
            to="/admin/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            <Settings className="w-4 h-4" />
            Settings
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
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed for mobile

  // Open sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Sidebar for Desktop */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} isMobile={false} />
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
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

        {/* Desktop Header with Profile Dropdown */}
        <div className="hidden lg:block fixed top-0 right-0 left-0 bg-white border-b shadow-sm z-30 h-16" style={{ marginLeft: isSidebarOpen ? '256px' : '80px' }}>
          <div className="h-full flex items-center justify-end px-6">
            <UserProfileDropdown />
          </div>
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

        {/* Content Area */}
        <main className="p-4 lg:p-8 mt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
