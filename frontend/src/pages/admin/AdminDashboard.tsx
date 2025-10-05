import React from 'react';
import {
  Users,
  MapPin,
  DollarSign,
  AlertCircle,
  Server,
  Database,
  Shield,
  TrendingUp,
  Activity,
  Cloud,
  Cpu,
  Network,
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';
import { Layout } from './Layout';

const AdminDashboard = () => {
  const stats = [
    { 
      label: 'ACTIVE LEASES', 
      value: '124', 
      icon: Database, 
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      trend: 'up'
    },
    { 
      label: 'PENDING LANDS', 
      value: '7', 
      icon: AlertCircle, 
      color: 'from-yellow-500 to-orange-500',
      change: '-3%',
      trend: 'down'
    },
    { 
      label: 'VERIFIED USERS', 
      value: '1,847', 
      icon: Users, 
      color: 'from-purple-500 to-pink-500',
      change: '+8%',
      trend: 'up'
    },
    { 
      label: 'TOTAL REVENUE', 
      value: '$2.4M', 
      icon: DollarSign, 
      color: 'from-emerald-500 to-green-500',
      change: '+23%',
      trend: 'up'
    },
  ];

  const quickActions = [
    { label: 'User Management', icon: Users, href: '/admin/users', color: 'from-purple-500 to-pink-500' },
    { label: 'Land Approval', icon: MapPin, href: '/admin/lands/pending', color: 'from-blue-500 to-cyan-500' },
    { label: 'Payment Review', icon: DollarSign, href: '/admin/payments', color: 'from-emerald-500 to-green-500' },
    { label: 'Dispute Resolution', icon: Shield, href: '/admin/disputes', color: 'from-red-500 to-orange-500' },
  ];

  const systemMetrics = [
    { label: 'Server Uptime', value: '99.9%', icon: Server, status: 'optimal' },
    { label: 'Database Load', value: '42%', icon: Database, status: 'normal' },
    { label: 'API Response', value: '128ms', icon: Activity, status: 'fast' },
    { label: 'Active Sessions', value: '284', icon: Users, status: 'normal' },
  ];

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0a1a55] via-[#1a2a88] to-[#2d1a88] rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,59,59,0.2),_transparent_50%)]" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 font-['Poppins'] uppercase tracking-wide">
            Admin Control Panel
          </h1>
          <p className="text-gray-300 text-lg font-['Inter'] max-w-2xl">
            Monitor and manage all platform activities with real-time analytics and powerful administrative tools.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-['Inter'] font-medium">System Operational</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Zap className="w-4 h-4" />
              <span className="font-['Inter']">Last updated: Just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium font-['Inter'] ${
                stat.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-['Inter'] uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white font-['Poppins']">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-['Poppins'] uppercase tracking-wide">
              Quick Actions
            </h2>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:border-white/20"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} w-fit mb-3`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-['Inter'] font-medium text-sm">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-['Poppins'] uppercase tracking-wide">
              System Metrics
            </h2>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <metric.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-['Inter'] text-sm">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-['Poppins'] font-medium">{metric.value}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    metric.status === 'optimal' ? 'bg-green-500' :
                    metric.status === 'fast' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-['Poppins'] uppercase tracking-wide">
            Recent Activity
          </h2>
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div className="space-y-3">
          {[
            { action: 'New user registration', user: 'John Doe', time: '2 min ago', type: 'user' },
            { action: 'Land listing approved', user: 'Sarah Smith', time: '5 min ago', type: 'land' },
            { action: 'Payment processed', user: 'Mike Johnson', time: '12 min ago', type: 'payment' },
            { action: 'Dispute resolved', user: 'Emma Wilson', time: '25 min ago', type: 'dispute' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'user' ? 'bg-blue-500/20' :
                  activity.type === 'land' ? 'bg-green-500/20' :
                  activity.type === 'payment' ? 'bg-purple-500/20' : 'bg-orange-500/20'
                }`}>
                  <Eye className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-white font-['Inter'] text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">by {activity.user}</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs font-['Inter']">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;