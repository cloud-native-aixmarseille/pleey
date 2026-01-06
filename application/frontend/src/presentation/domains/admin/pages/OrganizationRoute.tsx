import { Navigate } from "react-router-dom";

import { OrganizationDashboard } from "../components/organization/OrganizationDashboard";
import { useAuthManagerContext } from "../../auth";

export function OrganizationRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth/login" replace />;
  }

  return <OrganizationDashboard />;
}
