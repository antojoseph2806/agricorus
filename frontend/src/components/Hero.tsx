import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-earth-50" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-64 h-64 bg-primary-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-earth-200/20 rounded-full blur-3xl"
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
              <span className="text-primary-600 block">Investment Future</span>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/register" className="btn-primary inline-flex items-center">
                Start Investing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="btn-secondary inline-flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-12 flex items-center justify-center lg:justify-start space-x-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">Active Farms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">$2M+</div>
                <div className="text-sm text-gray-600">Funded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">15%</div>
                <div className="text-sm text-gray-600">Avg. Returns</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px]">
              {/* Farm Illustration */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-b from-primary-100 to-earth-100 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Sky */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-blue-200 to-blue-100" />
                
                {/* Sun */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-8 right-8 w-16 h-16 bg-yellow-400 rounded-full shadow-lg"
                />
                
                {/* Mountains */}
                <div className="absolute bottom-1/2 left-0 right-0">
                  <svg viewBox="0 0 400 100" className="w-full h-20">
                    <polygon points="0,100 100,20 200,60 300,10 400,40 400,100" fill="#10b981" opacity="0.3" />
                    <polygon points="0,100 80,40 160,70 240,30 320,50 400,100" fill="#059669" opacity="0.5" />
                  </svg>
                </div>
                
                {/* Fields */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2">
                  <div className="grid grid-cols-4 h-full">
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                      className="bg-primary-300 border-r border-primary-400"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      className="bg-primary-400 border-r border-primary-500"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="bg-primary-500 border-r border-primary-600"
                    />
                    <motion.div
                      animate={{ scaleY: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      className="bg-primary-600"
                    />
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-5, 5, -5], x: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  💰
                </motion.div>
                
                <motion.div
                  animate={{ y: [5, -5, 5], x: [2, -2, 2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/3 right-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  🌱
                </motion.div>
                
                <motion.div
                  animate={{ y: [-3, 3, -3], x: [-1, 1, -1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  📈
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