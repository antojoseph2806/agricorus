import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  Menu,
  X,
  Shield,
  FileText,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  BarChart3,
  UserCircle,
  CreditCard,
  Home,
  Zap,
  Activity,
  ShoppingCart,
  Package
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
      href: '/landownerdashboard' 
    },
    {
      label: 'Manage Profile',
      icon: UserCircle,
      href: '/profile',
      children: [
        { label: 'Verify Identity', icon: Shield, href: '/profile/kyc-verify' },
        { label: 'View Profile', icon: UserCircle, href: '/profile/view' },
        { label: 'KYC Status', icon: CheckCircle, href: '/profile/kyc-status' },
      ],
    },
    {
      label: 'Manage Lands',
      icon: MapPin,
      href: '/lands',
      children: [
        { label: 'Add Lands', icon: MapPin, href: '/lands/add' },
        { label: 'View Lands', icon: FileText, href: '/lands/view' },
      ],
    },
    {
      label: 'Manage Leases',
      icon: FileText,
      href: '/leases',
      children: [
        { label: 'All Requests', icon: FileText, href: '/leaserequests/all' },
        { label: 'Accepted Requests', icon: CheckCircle, href: '/leaserequests/accepted' },
        { label: 'Cancelled Requests', icon: XCircle, href: '/leaserequests/cancelled' },
        { label: 'Pending Requests', icon: AlertCircle, href: '/leaserequests/pending' },
        { label: 'Active Leases', icon: Activity, href: '/leaserequests/active' },
      ],
    },
    {
      label: 'Lease Payments',
      icon: CreditCard,
      href: '/payments',
      children: [
        { label: 'Payment History', icon: FileText, href: '/payment-history' },
        { label: 'Request Payment', icon: CreditCard, href: '/request-payment' },
      ],
    },
    {
      label: "UPI/Bank Management",
      icon: CreditCard,
      href: "/payouts",
      children: [
        { label: "Manage UPI", icon: CreditCard, href: "/payouts/upi" },
        { label: "Manage Bank Card", icon: CreditCard, href: "/payouts/bank" },
      ],
    },
    {
      label: 'Disputes History',
      icon: AlertTriangle,
      href: '/landowner/disputes',
    },
    {
      label: 'Marketplace',
      icon: ShoppingCart,
      href: '/marketplace',
      children: [
        { label: 'Browse Products', icon: Package, href: '/marketplace' },
        { label: 'My Cart', icon: ShoppingCart, href: '/cart' },
        { label: 'Order History', icon: FileText, href: '/orders' },
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
    localStorage.removeItem('role');
    navigate('/login');
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
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

        {/* Content Area */}
        <main className="p-4 lg:p-8 mt-16 lg:mt-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

// ----- Dashboard Page -----
const LandownerDashboard: React.FC = () => {
  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Landowner Dashboard
        </h1>
        <p className="text-emerald-100 text-lg max-w-2xl mb-4">
          Manage your agricultural leases, crowdfunding campaigns, and all operations in one powerful, enterprise-grade platform.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-100 bg-white/20 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-medium">System Operational</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-100">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Welcome to Your Dashboard
          </h2>
          <BarChart3 className="w-5 h-5 text-emerald-500" />
        </div>
        <p className="text-gray-600 mb-4">
          Get started by managing your lands, viewing lease requests, or checking your payment history.
        </p>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/lands/add"
            className="group bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl p-4 transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm mb-3 w-fit">
              <MapPin className="w-5 h-5 text-gray-700 group-hover:text-emerald-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm group-hover:text-emerald-700">Add New Land</span>
          </Link>
          
          <Link
            to="/lands/view"
            className="group bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl p-4 transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm mb-3 w-fit">
              <FileText className="w-5 h-5 text-gray-700 group-hover:text-emerald-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm group-hover:text-emerald-700">View My Lands</span>
          </Link>
          
          <Link
            to="/leaserequests/all"
            className="group bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl p-4 transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm mb-3 w-fit">
              <Users className="w-5 h-5 text-gray-700 group-hover:text-emerald-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm group-hover:text-emerald-700">Lease Requests</span>
          </Link>
          
          <Link
            to="/payment-history"
            className="group bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl p-4 transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm mb-3 w-fit">
              <CreditCard className="w-5 h-5 text-gray-700 group-hover:text-emerald-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm group-hover:text-emerald-700">Payment History</span>
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors">
              <MapPin className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <TrendingUp className="w-3 h-3" />
              Active
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Lands
            </p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors">
              <FileText className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <TrendingUp className="w-3 h-3" />
              Active
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Active Leases
            </p>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors">
              <CreditCard className="w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              <TrendingUp className="w-3 h-3" />
              Monthly
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Earnings
            </p>
            <p className="text-2xl font-bold text-gray-900">₹-</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandownerDashboard;