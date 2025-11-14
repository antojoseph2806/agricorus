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
  Server,
  Cloud,
  Database,
  Settings,
  BarChart3,
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
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('https://agricorus.onrender.com/api/auth/logout', {
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
      className={`flex flex-col h-full bg-gradient-to-b from-[#0a1a55] to-[#1a2a88] shadow-2xl border-r border-white/10 transition-all duration-300 ${
        isMobile ? 'w-64' : isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center h-16 border-b border-white/10 px-4 relative">
        <div
          className={`flex items-center transition-opacity duration-300 ${
            isSidebarOpen || isMobile ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white ml-2 font-['Poppins'] uppercase tracking-wide">Admin</span>
        </div>
        {!isMobile && (
          <button
            onClick={onToggleSidebar}
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm ${
              isSidebarOpen ? '-right-3' : 'right-2'
            }`}
          >
            {isSidebarOpen ? (
              <ChevronDown className="w-4 h-4 rotate-90 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 -rotate-90 text-white" />
            )}
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <div key={index}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {(isSidebarOpen || isMobile) && (
                      <span className="font-['Inter'] font-medium">{item.label}</span>
                    )}
                  </div>
                  {(isSidebarOpen || isMobile) && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
                {(isSidebarOpen || isMobile) && openDropdown === item.label && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                    {item.children.map((child, idx) => (
                      <a
                        key={idx}
                        href={child.href}
                        className="flex items-center px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 group"
                      >
                        <child.icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-['Inter']">{child.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <a
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {(isSidebarOpen || isMobile) && (
                  <span className="font-['Inter'] font-medium">{item.label}</span>
                )}
              </a>
            )}
          </div>
        ))}
      </nav>
      
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 group backdrop-blur-sm"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {(isSidebarOpen || isMobile) && (
            <span className="font-['Inter'] font-medium">Logout</span>
          )}
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a55]/90 via-[#1a2a88]/80 to-[#2d1a88]/90" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>
        
        {/* Floating tech elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

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
        className={`flex-1 transition-all duration-300 relative z-10 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0a1a55] to-[#1a2a88] border-b border-white/10 shadow-2xl z-40 h-16 flex items-center px-6 justify-between backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff3b3b] to-[#ff6b6b] rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-['Poppins'] uppercase tracking-wide">Admin Panel</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Overlay Sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
            <div className="fixed top-0 bottom-0 left-0 w-64 bg-gradient-to-b from-[#0a1a55] to-[#1a2a88] shadow-2xl transform transition-transform duration-300 ease-in-out">
              <div className="h-full relative">
                <Sidebar isSidebarOpen={true} onToggleSidebar={toggleSidebar} isMobile={true} />
                <button 
                  onClick={toggleSidebar} 
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
        </div>
        )}

        {/* Content Area with Top Margin for Mobile Header */}
        <main className="p-6 lg:p-8 mt-16 lg:mt-0 min-h-screen">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl min-h-[calc(100vh-8rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};