import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Menu,
  X,
  Shield,
  ShoppingCart,
  FileText,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Type definition for navigation items
interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  children?: NavItem[];
}

// ----- Navbar Component -----
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLandsDropdown, setShowLandsDropdown] = useState(false);
  const navigate = useNavigate();

  const navigationItems: NavItem[] = [
    { label: 'Manage Users', icon: Users, href: '/admin/users' },
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
    { label: 'Manage Projects', icon: TrendingUp, href: '/admin/projects' },
    { label: 'Handle Disputes', icon: AlertTriangle, href: '/admin/disputes' },
    { label: 'Manage Market', icon: ShoppingCart, href: '/admin/market' },
    { label: 'Payments', icon: DollarSign, href: '/admin/payments' },
    { label: 'Platform Reports', icon: FileText, href: '/admin/reports' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
    <nav className="bg-white shadow border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {navigationItems.map((item, index) => (
              <div key={index} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setShowLandsDropdown(!showLandsDropdown)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-emerald-600 transition"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label} <ChevronDown className={`w-3 h-3 transition-transform ${showLandsDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showLandsDropdown && (
                      <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md border z-10">
                        {item.children.map((child, idx) => (
                          <a
                            key={idx}
                            href={child.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowLandsDropdown(false)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-emerald-600 transition"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
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
      <div className={`lg:hidden transition-all ${isMenuOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
        <div className="bg-gray-50 px-4 py-4 space-y-2 border-t">
          {navigationItems.map((item, index) => (
            item.children ? (
              <div key={index}>
                <button
                  onClick={() => setShowLandsDropdown(!showLandsDropdown)}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-800 hover:bg-white justify-between"
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLandsDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLandsDropdown && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child, idx) => (
                      <a
                        key={idx}
                        href={child.href}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => { setIsMenuOpen(false); setShowLandsDropdown(false); }}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={index}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm text-gray-800 rounded hover:bg-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </a>
            )
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

// ----- Reusable Layout Wrapper -----
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};