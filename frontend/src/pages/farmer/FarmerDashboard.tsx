import React from "react";
import { motion } from "framer-motion";

const FarmerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-8 text-white mb-8 relative overflow-hidden shadow-lg"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome Back, Farmer!</h1>
          <p className="text-base text-white/90">
            Manage your agricultural leases, monitor your funds, and track your activities all in one place.
          </p>
        </div>
        {/* Animated Gradient Circle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-white/10 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default FarmerDashboard;