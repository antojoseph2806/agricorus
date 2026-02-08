import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sprout, Menu, X, ShoppingBag, TrendingUp, MapPin, 
  Info, Phone, Users, Store, ArrowRight, Sparkles 
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { 
      icon: TrendingUp, 
      label: 'Browse Investments Plans', 
      href: '#',
      description: 'Explore agricultural investment opportunities',
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      icon: MapPin, 
      label: 'Browse Lands', 
      href: '/public-lands',
      description: 'Find available agricultural lands',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: ShoppingBag, 
      label: 'Marketplace', 
      href: '/marketplace',
      description: 'Shop agricultural products',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: Info, 
      label: 'About Us', 
      href: '/about',
      description: 'Learn about our mission',
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      icon: Phone, 
      label: 'Contact Us', 
      href: '/contact',
      description: 'Get in touch with us',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' 
            : 'bg-white/90 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" onClick={handleLinkClick}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2 rounded-xl shadow-lg">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  AgriCorus
                </span>
              </motion.div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="#" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Browse Investments</Link>
              <Link to="/public-lands" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Browse Lands</Link>
              <Link 
                to="/marketplace" 
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors font-medium"
              >
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">Contact</Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
              <Link 
                to="/vendor/register" 
                className="px-6 py-2.5 bg-white text-emerald-600 font-bold rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition-all"
              >
                Vendor
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Premium Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={handleLinkClick}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 backdrop-blur-xl z-50 md:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-xl shadow-lg">
                      <Sprout className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        AgriCorus
                      </h2>
                      <p className="text-xs text-gray-600">Grow Your Future</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLinkClick}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </motion.button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                    <div className="text-lg font-bold text-emerald-600">500+</div>
                    <div className="text-xs text-gray-600">Farms</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                    <div className="text-lg font-bold text-emerald-600">₹2M+</div>
                    <div className="text-xs text-gray-600">Funded</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center border border-gray-200">
                    <div className="text-lg font-bold text-emerald-600">15%</div>
                    <div className="text-xs text-gray-600">Returns</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-6 space-y-3">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className="group block"
                    >
                      <div className="relative bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-300 transition-all hover:shadow-lg overflow-hidden">
                        {/* Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        
                        <div className="relative flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {item.label}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">{item.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-6 space-y-3">
                <Link
                  to="/register"
                  onClick={handleLinkClick}
                  className="group relative block"
                >
                  <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-2">
                      <Users className="w-5 h-5" />
                      <span>Get Started</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                <Link
                  to="/vendor/register"
                  onClick={handleLinkClick}
                  className="group block"
                >
                  <div className="bg-white text-emerald-600 font-bold rounded-2xl p-4 border-2 border-emerald-600 hover:bg-emerald-50 transition-all">
                    <div className="flex items-center justify-center gap-2">
                      <Store className="w-5 h-5" />
                      <span>Register as a Vendor</span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;