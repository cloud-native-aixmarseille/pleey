import { Navigate } from "react-router-dom";
import { OrganizationDashboard } from "../components/OrganizationDashboard";
import { useAuthManagerContext } from "../../../application/app/context/AuthManagerContext";

/**
 * Admin-only route for the organization dashboard.
 */
export function OrganizationRoute() {
  const { isAuthenticated, isAdmin } = useAuthManagerContext();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth/login" replace />;
  }

  return <OrganizationDashboard />;
}
