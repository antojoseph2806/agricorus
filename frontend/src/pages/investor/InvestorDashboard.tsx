import React from 'react';
import { InvestorLayout } from "./InvestorLayout";

const InvestorDashboard = () => {
  return (
    <InvestorLayout>
      <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Investor Dashboard</h1>
          <p className="text-emerald-100 text-lg">
            Manage your agricultural leases, crowdfunding campaigns, and all in one place.
          </p>
        </div>

        {/* You can add new dashboard content here later */}
      </div>
    </InvestorLayout>
  );
};

export default InvestorDashboard;
