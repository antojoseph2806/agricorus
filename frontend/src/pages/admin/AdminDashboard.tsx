import React from 'react';
import {
  Users,
  MapPin,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Layout } from './Layout';

const AdminDashboard = () => {
  const stats = [
    { label: 'Active Leases', value: '124', icon: MapPin, color: 'bg-blue-500' },
    { label: 'Pending Lands', value: '7', icon: AlertCircle, color: 'bg-yellow-500' },
    { label: 'Verified Users', value: '1,847', icon: Users, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: '$2.4M', icon: DollarSign, color: 'bg-emerald-500' },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-emerald-100 text-lg">
          Manage and monitor all platform activities and user data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
