import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Function to handle redirection to the editor
  const handleCreateNew = () => {
    navigate("/edit"); // This matches your 'edit/:id?' route
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here is your overview.</p>
        </div>

        {/* NEW DOCUMENT BUTTON */}
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
        >
          <span className="text-xl">+</span> New Document
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Total Docs", "Shared Docs", "Recent Edits"].map((stat) => (
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

      {/* Empty State / List Placeholder */}
      <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">
          You haven't created any documents yet.
        </p>
        <button
          onClick={handleCreateNew}
          className="text-blue-600 font-medium hover:underline"
        >
          Create your first document now →
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
