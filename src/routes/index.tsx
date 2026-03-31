import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import MainLayout from "../layout/MainLayout";
import PublicDocView from "../pages/PublicDocView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "view/:shareId",
    element: <PublicDocView />,
  },
]);
