import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  AlertTriangle,
  Menu,
  X,
  Shield,
  UserCircle,
  FileText,
  ChevronDown,
  Home,
  LogOut,
  IndianRupee
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
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const navigate = useNavigate();

  const navigationItems: NavItem[] = [
    { label: 'Home', icon: Home, href: '/investordashboard' },
    {
      label: 'Manage Profile',
      icon: UserCircle,
      href: '#',
      children: [
        { label: 'Verify Identity', icon: UserCircle, href: '/kyc/add' },
        { label: 'View Profile', icon: UserCircle, href: '/profile/view' },
        { label: 'KYC Status', icon: UserCircle, href: '/profile/kyc-status' },
      ],
    },
    { label: 'View Projects', icon: TrendingUp, href: '/crowdfunding' },
    { label: 'Investment History', icon: DollarSign, href: '/payments' },
    { label: 'Raise Dispute', icon: AlertTriangle, href: '/disputes' },
    { label: 'ROI Reports', icon: FileText, href: '/reports' },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Backend logout failed.');
      }
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={`flex flex-col h-full bg-white shadow-xl border-r transition-all duration-300 ${isMobile ? 'w-64' : (isSidebarOpen ? 'w-64' : 'w-20')}`}>
      <div className="flex items-center h-16 border-b px-4 relative">
        <div className={`flex items-center transition-opacity duration-300 ${isSidebarOpen || isMobile ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 ml-2">AgriCorus</span>
        </div>
        {!isMobile && (
          <button onClick={onToggleSidebar} className={`absolute top-1/2 -translate-y-1/2 ${isSidebarOpen ? '-right-4' : 'right-4'} p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition`}>
            {isSidebarOpen ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronDown className="w-4 h-4 -rotate-90" />}
          </button>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item, index) => (
          <div key={index}>
            {item.children ? (
              <>
                <button
                  onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {(isSidebarOpen || isMobile) && item.label}
                  </div>
                  {(isSidebarOpen || isMobile) && <ChevronDown className={`w-4 h-4 transition-transform ${showMoreDropdown ? 'rotate-180' : ''}`} />}
                </button>
                {(isSidebarOpen || isMobile) && showMoreDropdown && (
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
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} isMobile={false} />
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
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
          className={`lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="h-full relative">
            <Sidebar isSidebarOpen={true} onToggleSidebar={toggleSidebar} isMobile={true} />
            <button onClick={toggleSidebar} className="absolute top-4 right-4 text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area with Top Margin for Mobile Header */}
        <main className="p-4 lg:p-8 mt-16 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

// ----- Dashboard -----
const InvestorDashboard = () => {
  const stats = [
    { label: 'Active Leases', value: '100', icon: MapPin, color: 'bg-blue-500' },
    { label: 'Total Funding', value: '₹ 1 CR', icon: IndianRupee, color: 'bg-emerald-500' },
    { label: 'Verified Users', value: '1500', icon: Users, color: 'bg-purple-500' },
    { label: 'Success Rate', value: '95%', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Investor dashboard</h1>
        <p className="text-emerald-100 text-lg">
          Manage your agricultural leases, crowdfunding campaigns, and all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default InvestorDashboard;