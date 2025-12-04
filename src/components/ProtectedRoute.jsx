import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  // ---- FIX FOR ADMIN ACCESS ----
  const adminRoles = ["Admin", "Administrator", "System Manager"];

  if (requiredRole) {
    if (requiredRole === "Admin" && !adminRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    if (requiredRole !== "Admin" && user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }
  // ---- END FIX ----

  return children;
};

export default ProtectedRoute;
