import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

/**
 * RoleGuard component to protect routes based on user roles
 * - Redirects to "/" if user is not authenticated
 * - Redirects to appropriate dashboard if user has wrong role
 */
export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to role selection/login page
  if (!isAuthenticated) {
    return <Navigate to="/select-role" replace />;
  }

  // If user doesn't have a role yet, redirect to home
  if (!user?.role) {
    return <Navigate to="/select-role" replace />;
  }

  // If user's role is not in allowed roles, redirect to their correct dashboard
  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard based on their role
    switch (user.role) {
      case "doctor":
        return <Navigate to="/dashboard" replace />;
      case "patient":
        return <Navigate to="/dashboard" replace />;
      case "hospital_admin":
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // User has correct role, render the protected content
  return <>{children}</>;
};
