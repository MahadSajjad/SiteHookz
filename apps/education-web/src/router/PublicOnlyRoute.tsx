import { Navigate } from "react-router-dom";

import { useAuthStore } from "../stores/auth.store";

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useAuthStore();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
