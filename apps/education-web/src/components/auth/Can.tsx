import React from "react";
import { usePermission } from "../../hooks/usePermission";

interface CanProps {
  permission: string;
  branchId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({
  permission,
  branchId,
  fallback = null,
  children,
}: CanProps) {
  const hasPermission = usePermission(permission, branchId);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
