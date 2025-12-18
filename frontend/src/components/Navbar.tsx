import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sprout, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="bg-primary-600 p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgriCorus</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="#" className="text-gray-700 hover:text-primary-600 transition-colors">Browse Investments Plans</Link>
            <Link to="/public-lands" className="text-gray-700 hover:text-primary-600 transition-colors">Browse Lands</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">About Us</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact Us</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/vendor/register" className="btn-primary">Register as a vendor?</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/95 backdrop-blur-md rounded-lg mt-2 p-4 space-y-4"
          >
            <a href="#features" className="block text-gray-700 hover:text-primary-600 transition-colors">Features</a>
            <a href="#how-it-works" className="block text-gray-700 hover:text-primary-600 transition-colors">How it Works</a>
            <a href="#about" className="block text-gray-700 hover:text-primary-600 transition-colors">About</a>
            <Link to="/login" className="block text-gray-700 hover:text-primary-600 transition-colors">Login</Link>
            <Link to="/register" className="btn-primary block text-center">Get Started</Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;