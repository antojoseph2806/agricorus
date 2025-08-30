import React, { useState } from 'react';
import {
  Users, TrendingUp, MapPin, DollarSign, Calendar,
  Menu, X, Shield, ShoppingCart, FileText, CreditCard, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Verify Identity', icon: Shield, href: '/kyc' },
    { label: 'View Lands', icon: MapPin, href: '/lands/farmer' },
    { label: 'Apply for Crowdfunding', icon: TrendingUp, href: '/crowdfunding' },
    { label: 'Lease History', icon: FileText, href: '/agreements' },
    { label: 'Payments', icon: CreditCard, href: '/payments' },
    { label: 'Raise Dispute', icon: AlertTriangle, href: '/disputes' }
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
          {/* Logo */}
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
                <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-md border z-10">
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

            {/* Logout */}
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

export default FarmerNavbar;
