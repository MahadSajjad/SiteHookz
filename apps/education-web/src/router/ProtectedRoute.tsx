import { Navigate } from "react-router-dom";

import { useAuthStore } from "../stores/auth.store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useAuthStore();

  if (status === "loading") {
    return <div>Loading...</div>; // Could be a nicer spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
