import React from "react";
import { Users, TrendingUp, MapPin, DollarSign, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const FarmerDashboard: React.FC = () => {
  const stats = [
    { label: "Active Leases", value: 124, icon: MapPin, color: "bg-blue-500" },
    { label: "Total Funding", value: 2400000, icon: DollarSign, color: "bg-emerald-500" },
    { label: "Verified Users", value: 1847, icon: Users, color: "bg-purple-500" },
    { label: "Success Rate", value: 94, icon: TrendingUp, color: "bg-orange-500" },
  ];

  const recentActivities = [
    { action: "New lease agreement signed", time: "2 hours ago", status: "completed" },
    { action: "KYC verification pending", time: "4 hours ago", status: "pending" },
    { action: "Crowdfunding goal reached", time: "1 day ago", status: "completed" },
    { action: "Payment received", time: "2 days ago", status: "completed" },
    { action: "Dispute raised", time: "3 days ago", status: "alert" },
  ];

  const counter = (value: number) =>
    value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : value.toLocaleString();

  const quickActions = [
    { title: "Create New Lease", desc: "Start a new agricultural lease agreement", color: "emerald" },
    { title: "Launch Campaign", desc: "Begin a new crowdfunding campaign", color: "blue" },
    { title: "Browse Marketplace", desc: "Shop for seeds and fertilizers", color: "purple" },
  ];

  return (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome to Farmer Dashboard</h1>
        <p className="text-emerald-100 text-lg">
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
                <p className="text-3xl font-bold text-gray-900">{counter(stat.value)}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-500" /> Recent Activities
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: activity.status === "pending" ? [1, 1.5, 1] : 1 }}
                  transition={{ repeat: activity.status === "pending" ? Infinity : 0, duration: 1 }}
                  className={`w-2 h-2 rounded-full ${
                    activity.status === "completed" ? "bg-emerald-500" : activity.status === "pending" ? "bg-yellow-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium text-gray-900">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`p-4 border rounded-lg text-left transition 
                ${action.color === "emerald" ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : ""}
                ${action.color === "blue" ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : ""}
                ${action.color === "purple" ? "bg-purple-50 border-purple-200 hover:bg-purple-100" : ""}
              `}
            >
              <h3
                className={`font-medium ${
                  action.color === "emerald" ? "text-emerald-900" : ""
                } ${action.color === "blue" ? "text-blue-900" : ""} ${action.color === "purple" ? "text-purple-900" : ""}`}
              >
                {action.title}
              </h3>
              <p
                className={`text-sm ${
                  action.color === "emerald" ? "text-emerald-700" : ""
                } ${action.color === "blue" ? "text-blue-700" : ""} ${action.color === "purple" ? "text-purple-700" : ""} mt-1`}
              >
                {action.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
};

export default FarmerDashboard;
