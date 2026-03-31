import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here is your overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Total Users", "Revenue", "Active Sessions"].map((stat) => (
          <div
            key={stat}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500 uppercase">
              {stat}
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
