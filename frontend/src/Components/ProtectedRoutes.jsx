import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, children, adminOnly = false }) {
  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route protection
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
