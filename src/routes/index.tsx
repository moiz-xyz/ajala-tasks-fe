import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import MainLayout from "../layout/MainLayout";
import PublicDocView from "../pages/PublicDocView";
import EditDoc from "../pages/EditDoc";
import ProtectedRoute from "../components/ProtectedRoutes";
import Login from "../pages/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />, // 🔒 Protection Layer
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "edit/:id?", element: <EditDoc /> },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> }, // Public
  { path: "/view/:shareId", element: <PublicDocView /> }, // Public
]);
