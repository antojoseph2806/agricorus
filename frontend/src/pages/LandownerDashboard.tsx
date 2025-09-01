import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  FileSignature,
  Calendar,
  Menu,
  Home,
  UserCircle,
  X,
  ShoppingCart,
  FileText,
  CreditCard,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ----- Sidebar Component -----
interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  children?: NavItem[];
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();

  const navigationItems: NavItem[] = [
    { label: 'Home', icon: Home, href: '/landownerdashboard' },
    {
      label: 'Manage Profile',
      icon: UserCircle,
      href: '/profile',
      children: [
        { label: 'Verify Identity', icon: UserCircle, href: '/kyc/add' },
        { label: 'View Profile', icon: UserCircle, href: '/profile/view' },
        { label: 'KYC Status', icon: UserCircle, href: '/profile/kyc-status' },
      ],
    },
    {
      label: 'Manage Lands',
      icon: MapPin,
      href: '/lands',
      children: [
        { label: 'Add Lands', icon: MapPin, href: '/lands/add' },
        { label: 'View Lands', icon: MapPin, href: '/lands/view' },
      ],
    },
    { label: 'Purchase Seeds & Fertilizers', icon: ShoppingCart, href: '/marketplace' },
    {
      label: 'Lease Requests',
      icon: FileText,
      href: '/leaserequests',
      children: [
        { label: 'All Requests', icon: FileText, href: '/leaserequests/all' },
        { label: 'Accepted Requests', icon: FileText, href: '/leaserequests/accepted' },
        { label: 'Cancelled Requests', icon: FileText, href: '/leaserequests/cancelled' },
        { label: 'Pending Requests', icon: FileText, href: '/leaserequests/pending' },
      ],
    },
    { label: 'Digital Agreements', icon: FileSignature, href: '/agreements' },
    { label: 'Lease Payments', icon: CreditCard, href: '/payments' },
    { label: 'Raise Dispute', icon: AlertTriangle, href: '/disputes' },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.warn('Logout failed, clearing local token.');
      }
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <MapPin className="w-6 h-6 text-emerald-500" />
              <span className="text-xl font-bold text-gray-900">AgriCorus</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse Button (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            {isCollapsed ? <Menu className="w-4 h-4 text-gray-700" /> : <X className="w-4 h-4 text-gray-700" />}
          </button>

          {/* Close button for mobile */}
          <button className="lg:hidden p-2" onClick={() => setIsMobileOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {!isCollapsed && (
        <nav className="flex-1 overflow-y-auto mt-4 px-2 text-sm">
          {navigationItems.map((item, idx) => (
            <div key={idx} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        activeDropdown === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {activeDropdown === item.label && (
                    <div className="ml-8 mt-1 flex flex-col space-y-1">
                      {item.children.map((child, id) => (
                        <a
                          key={id}
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                        >
                          <child.icon className="w-4 h-4" />
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </a>
              )}
            </div>
          ))}

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
            Logout
          </button>
        </nav>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {SidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg transition-transform duration-300">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Hamburger */}
      {!isMobileOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg lg:hidden hover:bg-gray-100 transition"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      )}
    </>
  );
};

// ----- Layout Component -----
interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

// ----- Dashboard Page -----
const LandownerDashboard: React.FC = () => {
  const stats = [
    { label: 'Active Leases', value: '124', icon: MapPin, color: 'bg-blue-500' },
    { label: 'Total Funding', value: '$2.4M', icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Verified Users', value: '1,847', icon: Users, color: 'bg-purple-500' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { action: 'New lease agreement signed', time: '2 hours ago', status: 'completed' },
    { action: 'KYC verification pending', time: '4 hours ago', status: 'pending' },
    { action: 'Crowdfunding goal reached', time: '1 day ago', status: 'completed' },
    { action: 'Payment received', time: '2 days ago', status: 'completed' },
    { action: 'Dispute raised', time: '3 days ago', status: 'alert' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Landowner Dashboard</h1>
        <p className="text-emerald-100 text-lg">
          Manage your agricultural leases, crowdfunding campaigns, and marketplace activities all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
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

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-500" />
            Recent Activities
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {recentActivities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.status === 'completed'
                      ? 'bg-emerald-500'
                      : activity.status === 'pending'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="font-medium text-gray-900">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition text-left">
            <h3 className="font-medium text-emerald-900">Create New Lease</h3>
            <p className="text-sm text-emerald-700 mt-1">Start a new agricultural lease agreement</p>
          </button>
          <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-left">
            <h3 className="font-medium text-blue-900">Launch Campaign</h3>
            <p className="text-sm text-blue-700 mt-1">Begin a new crowdfunding campaign</p>
          </button>
          <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition text-left">
            <h3 className="font-medium text-purple-900">Browse Marketplace</h3>
            <p className="text-sm text-purple-700 mt-1">Shop for seeds and fertilizers</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default LandownerDashboard;
