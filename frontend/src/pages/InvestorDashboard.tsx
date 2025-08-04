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
  ShoppingCart,
  FileText,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ----- Navbar Component -----
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'View Lands', icon: MapPin, href: '/lands' },
    { label: 'View Projects', icon: TrendingUp, href: '/crowdfunding' },
    { label: 'Investment history', icon: CreditCard, href: '/payments' },
    { label: 'Raise Dispute', icon: AlertTriangle, href: '/disputes' },
    { label: 'My Profile', icon: AlertTriangle, href: '/disputes' },
    { label: 'Verify Identity', icon: Shield, href: '/kyc' },
    { label: 'ROI Reports', icon: AlertTriangle, href: '/disputes' },
  ];

  const mainItems = navigationItems.slice(0, 4);
  const moreItems = navigationItems.slice(4);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleMore = () => setShowMore(!showMore);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgriCorus</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-4">
            {mainItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-emerald-600 transition"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={toggleMore}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-emerald-600"
              >
                More ▾
              </button>
              {showMore && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md border z-10">
                  {moreItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-emerald-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all ${isMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
        <div className="bg-gray-50 px-4 py-4 space-y-2 border-t">
          {navigationItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm text-gray-800 rounded hover:bg-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-white"
          >
            <X className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// ----- Layout Wrapper -----
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

// ----- Dashboard -----
const InvestorDashboard = () => {
  const stats = [
    { label: 'Active Leases', value: '124', icon: MapPin, color: 'bg-blue-500' },
    { label: 'Total Funding', value: '$2.4M', icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Verified Users', value: '1,847', icon: Users, color: 'bg-purple-500' },
    { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  const recentActivities = [
    { action: 'New lease agreement signed', time: '2 hours ago', status: 'completed' },
    { action: 'KYC verification pending', time: '4 hours ago', status: 'pending' },
    { action: 'Crowdfunding goal reached', time: '1 day ago', status: 'completed' },
    { action: 'Payment received', time: '2 days ago', status: 'completed' },
    { action: 'Dispute raised', time: '3 days ago', status: 'alert' }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Investor dashboard</h1>
        <p className="text-emerald-100 text-lg">
          Manage your agricultural leases, crowdfunding campaigns, and marketplace activities all in one place.
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

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-500" />
            Recent Activities
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-emerald-500' :
                  activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-gray-900">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 text-left">
            <h3 className="font-medium text-emerald-900">Create New Lease</h3>
            <p className="text-sm text-emerald-700 mt-1">Start a new agricultural lease agreement</p>
          </button>
          <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 text-left">
            <h3 className="font-medium text-blue-900">Launch Campaign</h3>
            <p className="text-sm text-blue-700 mt-1">Begin a new crowdfunding campaign</p>
          </button>
          <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-left">
            <h3 className="font-medium text-purple-900">Browse Marketplace</h3>
            <p className="text-sm text-purple-700 mt-1">Shop for seeds and fertilizers</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;
