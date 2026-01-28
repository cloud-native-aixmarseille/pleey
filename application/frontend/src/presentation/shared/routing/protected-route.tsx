import type { PropsWithChildren } from 'react';
import { useAuth } from '../../identity/contexts/auth-context';
import { PresentationRedirect } from './router';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { hasRestoredSession, isAuthenticated } = useAuth();

  if (!hasRestoredSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <PresentationRedirect replace to="/identity/sign-in" />;
  }

  return children;
}
