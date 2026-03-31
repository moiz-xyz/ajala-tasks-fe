import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SIdebar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white shadow-sm">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
