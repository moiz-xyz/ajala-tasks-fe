import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const links = [{ name: "Dashboard", path: "/" }];

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-8 px-4 text-xl font-bold text-blue-600">My App</h2>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === link.path
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
