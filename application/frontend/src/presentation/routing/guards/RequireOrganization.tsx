import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useOrganization } from "../../domains/admin/context/OrganizationContext";
import { useAuthManagerContext } from "../../domains/auth";

interface RequireOrganizationProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RequireOrganization({
  children,
  redirectTo = "/admin/organization",
}: RequireOrganizationProps) {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();
  const { currentOrganization } = useOrganization();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!currentOrganization) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
