import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "@/pages/Home";
import LogMeal from "@/pages/LogMeal";
import Profile from "@/pages/Profile";
import Analytics from "@/pages/Analytics";
import MainLayout from "@/layouts/MainLayout";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { BreadCrumbProvider } from "@/hooks/BreadCrumbContext";
import Register from "@/pages/Register";
import LogIn from "@/pages/LogIn";
import OAuthCallback from "@/pages/OAuthCallback";
import { AuthProvider } from "@/hooks/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "/log-meal",
            element: <LogMeal />,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/analytics",
            element: <Analytics />,
          },
        ],
      },
    ],
  },
  {
    path:"/register",
    element:<Register/>
  },
  {
    path:"/login",
    element:<LogIn/>
  },
  {
    path: "/oauth/callback",
    element: <OAuthCallback />,
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BreadCrumbProvider>
          <RouterProvider router={router} />
        </BreadCrumbProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
