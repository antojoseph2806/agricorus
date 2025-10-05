import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  IndianRupee,
  Menu,
  Home,
  X,
  UserCircle,
  LogOut,
  FileText,
  CreditCard,
  AlertTriangle,
  ShoppingBag,
  Shield,
  ChevronDown,
  Server,
  Cloud,
  Lock,
  Cpu,
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
      href: '#',
      children: [
        { label: 'Verify Identity', icon: UserCircle, href: '#' },
        { label: 'View Profile', icon: UserCircle, href: '/profile/view' },
        { label: 'KYC Status', icon: UserCircle, href: '#' },
      ],
    },
    {
      label: 'Manage Lands',
      icon: MapPin,
      href: '#',
      children: [
        { label: 'Add Lands', icon: MapPin, href: '/lands/add' },
        { label: 'View Lands', icon: MapPin, href: '/lands/view' },
      ],
    },
    {
      label: 'Manage Leases',
      icon: FileText,
      href: '#',
      children: [
        { label: 'All Requests', icon: FileText, href: '/leaserequests/all' },
        { label: 'Accepted Requests', icon: FileText, href: '/leaserequests/accepted' },
        { label: 'Cancelled Requests', icon: FileText, href: '/leaserequests/cancelled' },
        { label: 'Pending Requests', icon: FileText, href: '/leaserequests/pending' },
        { label: 'Active Leases', icon: FileText, href: '/leaserequests/active' },
      ],
    },
    {
      label: 'Lease Payments',
      icon: CreditCard,
      href: '#',
      children: [
        { label: 'Payment history', icon: FileText, href: '/payment-history' },
        { label: 'Request for Lease Payment', icon: FileText, href: '/request-payment' },
      ],
    },
    {
    label: "UPI/Bank Management",
    icon: CreditCard,
    href: "#",
    children: [
      { label: "Manage UPI", icon: UserCircle, href: "/payouts/upi" },
      { label: "Manage Bank Card", icon: UserCircle, href: "/payouts/bank" },
    ],
  },
    {
      label: 'Disputes',
      icon: AlertTriangle,
      href: '#',
      children: [
        { label: 'Raised by You', icon: FileText, href: '#' },
        { label: 'Raised Against You', icon: FileText, href: '#' },
        
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
      } catch (err) {
        console.warn('Logout failed, clearing local token.');
      }
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <Shield className="w-6 h-6 text-red-500" />
              <span className="text-xl font-bold text-white font-poppins">AGRI<span className="text-red-500">CORUS</span></span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Collapse Button (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 bg-gray-800 border border-gray-700 rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 hover:scale-110"
          >
            {isCollapsed ? <Menu className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
          </button>

          {/* Close button for mobile */}
          <button 
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-all duration-300" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      {!isCollapsed && (
        <div className="flex flex-col flex-1">
          <nav className="flex-1 overflow-y-auto mt-4 px-2 text-sm font-inter">
            {navigationItems.map((item, idx) => (
              <div key={idx} className="mb-1">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between px-3 py-3 text-gray-300 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:translate-x-1 group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.label ? 'rotate-180 text-red-400' : 'text-gray-400'
                        }`}
                      />
                    </button>
                    {activeDropdown === item.label && (
                      <div className="ml-6 mt-1 flex flex-col space-y-1 border-l-2 border-gray-700 pl-3">
                        {item.children.map((child, id) => (
                          <a
                            key={id}
                            href={child.href}
                            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-300 hover:translate-x-1"
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
                    className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:translate-x-1 group"
                  >
                    <item.icon className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Logout Button (Bottom Left) */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300 hover:translate-x-1 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 transition-all duration-300 relative shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {SidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 lg:hidden backdrop-blur-sm">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transition-transform duration-300 border-r border-gray-700">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Hamburger */}
      {!isMobileOpen && (
        <button
          className="fixed top-6 left-6 z-50 p-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-2xl lg:hidden hover:scale-110 transition-all duration-300 border border-gray-700"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-6 h-6 text-white" />
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-hidden">{children}</main>
    </div>
  );
};

// ----- Dashboard Page -----
const LandownerDashboard: React.FC = () => {
  const techIcons = [Server, Cloud, Lock, Cpu];
  
  const stats = [
    { 
      label: 'ACTIVE LEASES', 
      value: '100', 
      icon: techIcons[0], 
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    { 
      label: 'TOTAL FUNDING', 
      value: '₹1 CR', 
      icon: techIcons[1], 
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    },
    { 
      label: 'VERIFIED USERS', 
      value: '1500', 
      icon: techIcons[2], 
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    },
    { 
      label: 'SUCCESS RATE', 
      value: '95%', 
      icon: techIcons[3], 
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10'
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-2xl p-8 lg:p-12 text-white mb-8 border border-white/10 backdrop-blur-sm overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 font-poppins uppercase tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            LANDOWNER DASHBOARD
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 max-w-3xl leading-relaxed">
            Manage your agricultural leases, crowdfunding campaigns, and all operations in one powerful, 
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent font-semibold"> enterprise-grade platform</span>
          </p>
          
          {/* CTA Button */}
          <div className="mt-6 flex gap-4">
            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 border border-red-400/50">
              Get Started
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20 backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
          >
            {/* Hover glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-3xl font-bold text-white font-poppins">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Progress bar for visual effect */}
              <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-1000 ease-out`}
                  style={{ width: stat.label === 'SUCCESS RATE' ? '95%' : '80%' }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Tech Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Card */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500">
          <h3 className="text-xl font-bold text-white mb-4 font-poppins uppercase tracking-wide">RECENT ACTIVITY</h3>
          <div className="space-y-4">
            {['New lease request received', 'Payment processed successfully', 'Profile verification completed'].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <div className="w-2 h-2 bg-red-500 rounded-full group-hover:scale-150 transition-transform"></div>
                <span className="text-gray-300 group-hover:text-white transition-colors">{activity}</span>
                <span className="ml-auto text-sm text-gray-500">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500">
          <h3 className="text-xl font-bold text-white mb-4 font-poppins uppercase tracking-wide">SYSTEM STATUS</h3>
          <div className="space-y-4">
            {[
              { service: 'Lease Management', status: 'Operational', color: 'bg-green-500' },
              { service: 'Payment Gateway', status: 'Operational', color: 'bg-green-500' },
              { service: 'Document Verification', status: 'Maintenance', color: 'bg-yellow-500' }
            ].map((system, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-300">{system.service}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${system.color} rounded-full animate-pulse`}></div>
                  <span className="text-sm text-gray-400">{system.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandownerDashboard;