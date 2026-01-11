import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, MapPin, TrendingUp, Shield, Leaf, Building } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-green-200/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Cultivate Your
              <span className="text-emerald-600 block">Investment Future</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Connect with agricultural opportunities through our innovative land lease and crowdfunding platform. 
              Invest in sustainable farming and grow your portfolio while supporting local agriculture.
            </motion.p>

            {/* Platform Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
            >
              <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">For Farmers</h3>
                <p className="text-sm text-gray-600 text-center">Access funding and land opportunities</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">For Landowners</h3>
                <p className="text-sm text-gray-600 text-center">Monetize your agricultural land</p>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-emerald-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">For Investors</h3>
                <p className="text-sm text-gray-600 text-center">Invest in sustainable agriculture</p>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                Join AgriCorus Today
              </Link>
              <Link 
                to="/marketplace" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl border-2 border-emerald-600 hover:bg-emerald-50 transition-all"
              >
                Explore Marketplace
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="mt-12 flex items-center justify-center lg:justify-start space-x-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-gray-600">Active Farms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">$2M+</div>
                <div className="text-sm text-gray-600">Funded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">15%</div>
                <div className="text-sm text-gray-600">Avg. Returns</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Main Platform Illustration */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-b from-emerald-100 to-green-100 rounded-3xl shadow-2xl overflow-hidden border border-emerald-200"
              >
                {/* Sky with Clouds */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-blue-200 to-blue-100">
                  <motion.div
                    animate={{ x: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-4 left-8 w-16 h-8 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ x: [0, -15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-8 right-12 w-12 h-6 bg-white/50 rounded-full"
                  />
                </div>
                
                {/* Sun */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-8 right-8 w-16 h-16 bg-yellow-400 rounded-full shadow-lg"
                />
                
                {/* Mountains/Hills */}
                <div className="absolute bottom-1/2 left-0 right-0">
                  <svg viewBox="0 0 400 100" className="w-full h-20">
                    <polygon points="0,100 100,20 200,60 300,10 400,40 400,100" fill="#10b981" opacity="0.3" />
                    <polygon points="0,100 80,40 160,70 240,30 320,50 400,100" fill="#059669" opacity="0.5" />
                  </svg>
                </div>
                
                {/* Agricultural Fields */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2">
                  <div className="grid grid-cols-4 h-full">
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                      className="bg-emerald-300 border-r border-emerald-400"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      className="bg-emerald-400 border-r border-emerald-500"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="bg-emerald-500 border-r border-emerald-600"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      className="bg-emerald-600"
                    />
                  </div>
                </div>
                
                {/* Platform Feature Icons */}
                <motion.div
                  animate={{ y: [-5, 5, -5], x: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 left-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-200"
                >
                  <Shield className="w-6 h-6 text-emerald-600" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [5, -5, 5], x: [2, -2, 2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/3 right-1/4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-200"
                >
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [-3, 3, -3], x: [-1, 1, -1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-200"
                >
                  <Building className="w-6 h-6 text-emerald-600" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;