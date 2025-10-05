import React from 'react';
import {
  Users,
  TrendingUp,
  MapPin,
  IndianRupee
} from 'lucide-react';
import { InvestorLayout } from "./InvestorLayout";

// ----- Dashboard -----
const InvestorDashboard = () => {
  const stats = [
    { label: 'Active Leases', value: '100', icon: MapPin, color: 'bg-blue-500' },
    { label: 'Total Funding', value: '₹ 1 CR', icon: IndianRupee, color: 'bg-emerald-500' },
    { label: 'Verified Users', value: '1500', icon: Users, color: 'bg-purple-500' },
    { label: 'Success Rate', value: '95%', icon: TrendingUp, color: 'bg-orange-500' }
  ];

  return (
     <InvestorLayout>
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Investor dashboard</h1>
        <p className="text-emerald-100 text-lg">
          Manage your agricultural leases, crowdfunding campaigns, and all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </InvestorLayout>
  );
};

export default InvestorDashboard;
