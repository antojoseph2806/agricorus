import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Menu,
  X,
  Shield,
  Home,
  FileText,
  AlertTriangle,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const navigationItems: NavItem[] = [
    { label: 'Home', 
          icon: Home, 
          href: '/admindashboard' },
 {
  label: "Manage Users",
  icon: Users,
  href: "/admin/users",
  children: [
    { label: "Landowners", icon: FileText, href: "/admin/users/landowners" },
    { label: "Farmers", icon: AlertCircle, href: "/admin/users/farmers" },
    { label: "Investors", icon: CheckCircle, href: "/admin/users/investors" },
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
  icon: AlertTriangle,
  href: "/admin/leases", // default: view all leases
  children: [
    { label: "View All Leases", icon: FileText, href: "/admin/leases" },
  ],
},
 { label: 'Manage Projects', icon: Home, href: '/admin/manage-projects' },

    { label: 'Manage Investments', 
      icon: Home, 
      href: '#' },
    {
      label: 'Handle Disputes',
      icon: AlertTriangle,
      href: '/admin/disputes',
      children: [
        { label: 'All Disputes', icon: FileText, href: '#' },
        { label: 'Rejected Disputes', icon: AlertCircle, href: '#' },
        { label: 'Solved Disputes', icon: CheckCircle, href: '#' },
        { label: 'Pending Disputes', icon: XCircle, href: '#' },
      ],
    },
    {
      label: 'Manage Payments',
      icon: DollarSign,
      href: '/admin/payments',
      children: [
        { label: 'Lease Payment Requests', icon: FileText, href: '#' },
        { label: 'Project Payment Requests', icon: AlertCircle, href: '#' },
        { label: 'Lease Payment History', icon: FileText, href: '#' },
        { label: 'Project Payment History', icon: AlertCircle, href: '#' },
      ],
    },
    {
      label: 'Platform Reports',
      icon: FileText,
      href: '/admin/reports',
      children: [
        { label: 'Lease Reports', icon: FileText, href: '#' },
        { label: 'Project Reports', icon: AlertCircle, href: '#' },
      ],
    },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn('Backend logout failed.');
      }
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white shadow-xl border-r transition-all duration-300 ${
        isMobile ? 'w-64' : isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center h-16 border-b px-4 relative">
        <div
          className={`flex items-center transition-opacity duration-300 ${
            isSidebarOpen || isMobile ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 ml-2">Admin Panel</span>
        </div>
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            className={`absolute top-1/2 -translate-y-1/2 ${
              isSidebarOpen ? '-right-4' : 'right-4'
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
                    {(isSidebarOpen || isMobile) && item.label}
                  </div>
                  {(isSidebarOpen || isMobile) && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                {(isSidebarOpen || isMobile) && openDropdown === item.label && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child, idx) => (
                      <a
                        key={idx}
                        href={child.href}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      >
                        <child.icon className="w-4 h-4 mr-2" />
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <a
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <item.icon className="w-4 h-4" />
                {(isSidebarOpen || isMobile) && item.label}
              </a>
            )}
          </div>
        ))}
      </nav>
      <div className="px-4 py-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
        >
          <LogOut className="w-4 h-4" />
          {(isSidebarOpen || isMobile) && 'Logout'}
        </button>
      </div>
    </div>
  );
};

// ----- Reusable Layout Wrapper -----
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
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
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full relative">
            <Sidebar isSidebarOpen={true} onToggleSidebar={toggleSidebar} isMobile={true} />
            <button onClick={toggleSidebar} className="absolute top-4 right-4 text-gray-700">
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
