import React from "react";

const Settings: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-6 bg-blue-600 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between">
          {/* <div>
            <p className="font-medium text-gray-900">Public Profile</p>
            <p className="text-sm text-gray-500">
              Allow others to see your activity.
            </p>
          </div> */}
          <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
