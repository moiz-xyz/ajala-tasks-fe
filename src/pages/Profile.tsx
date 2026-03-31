import React from "react";

const Profile: React.FC = () => {
  return (
    <div className="max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="h-32 bg-linear-to-r from-blue-500 to-indigo-600"></div>
      <div className="px-8 pb-8">
        <div className="relative -mt-12 mb-6">
          <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600 shadow-md">
            JD
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
        <p className="text-gray-500">Administrator</p>
        <hr className="my-6 border-gray-100" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
