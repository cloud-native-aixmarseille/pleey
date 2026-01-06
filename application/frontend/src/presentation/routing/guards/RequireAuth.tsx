import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthManagerContext } from "../../domains/auth";

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({
  children,
  redirectTo = "/auth/login",
}: RequireAuthProps) {
  const { isAuthenticated } = useAuthManagerContext();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
