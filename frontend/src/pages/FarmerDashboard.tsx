import React from "react";
import { Users, TrendingUp, MapPin, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const FarmerDashboard: React.FC = () => {
  const stats = [
    { label: "Active Leases", value: 124, icon: MapPin, color: "bg-blue-500" },
    { label: "Total Funding", value: 2400000, icon: DollarSign, color: "bg-emerald-500" },
    { label: "Verified Users", value: 1847, icon: Users, color: "bg-purple-500" },
    { label: "Success Rate", value: 94, icon: TrendingUp, color: "bg-orange-500" },
  ];

  const counter = (value: number) =>
    value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : value.toLocaleString();

  return (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome to Farmer Dashboard</h1>
        <p className="text-base text-emerald-100">
          Manage your agricultural leases, crowdfunding campaigns, and marketplace activities all in one place.
        </p>
        {/* Animated Gradient Circle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-white/10 rounded-full"
        />
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{counter(stat.value)}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default FarmerDashboard;
