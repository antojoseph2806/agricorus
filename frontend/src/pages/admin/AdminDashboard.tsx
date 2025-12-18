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
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';
import { Layout } from './Layout';

// Define placeholder types for future data fetching clarity
interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  change: string;
  trend: 'up' | 'down';
}

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface SystemMetric {
  label: string;
  value: string;
  icon: React.ElementType;
  status: 'optimal' | 'normal' | 'fast';
}

interface RecentActivity {
  action: string;
  user: string;
  time: string;
  type: 'user' | 'land' | 'payment' | 'dispute';
}


const AdminDashboard = () => {
  // Static data arrays have been cleared to prepare for dynamic data fetching
  const stats: Stat[] = [];
  const quickActions: QuickAction[] = [];
  const systemMetrics: SystemMetric[] = [];
  const recentActivity: RecentActivity[] = [];

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Admin Control Panel
        </h1>
        <p className="text-emerald-100 text-lg max-w-2xl mb-4">
          Monitor and manage all platform activities with real-time analytics and powerful administrative tools.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-100 bg-white/20 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="font-medium">System Operational</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-100">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Renders only if stats data is present */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-emerald-50 transition-colors`}>
                  <stat.icon className={`w-6 h-6 text-gray-600 group-hover:text-emerald-600 transition-colors`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Sections - Render only if data is present */}
      {(quickActions.length > 0 || systemMetrics.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Quick Actions
                </h2>
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="group bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 rounded-xl p-4 transition-all duration-300"
                  >
                    <div className={`p-2 rounded-lg bg-white shadow-sm mb-3 w-fit`}>
                      <action.icon className="w-5 h-5 text-gray-700 group-hover:text-emerald-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm group-hover:text-emerald-700">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* System Metrics */}
          {systemMetrics.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  System Metrics
                </h2>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <metric.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 font-medium text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-bold">{metric.value}</span>
                      <div className={`w-2 h-2 rounded-full ${metric.status === 'optimal' ? 'bg-green-500' :
                          metric.status === 'fast' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Activity
            </h2>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'land' ? 'bg-green-100 text-green-600' :
                        activity.type === 'payment' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium text-sm">{activity.action}</p>
                    <p className="text-gray-500 text-xs">by {activity.user}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs font-medium">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
