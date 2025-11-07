import React from "react";
// Removed unused imports: Users, TrendingUp, MapPin, IndianRupee, FileText, Scale, Zap
import { motion } from "framer-motion";

const FarmerDashboard: React.FC = () => {
  // Removed the 'stats' array, 'counter' function, and 'quickActions' array

  return (
    <div className="p-4 md:p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome Back, Farmer!</h1>
        <p className="text-base text-emerald-100">
          Manage your agricultural leases, monitor your funds, and track your activities all in one place.
        </p>
        {/* Animated Gradient Circle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-white/10 rounded-full"
        />
      </motion.div>

      {/* This area is now ready for future content, such as a feed or specific component embeds */}
      
    </div>
  );
};

export default FarmerDashboard;