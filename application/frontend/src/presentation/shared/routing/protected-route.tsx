import type { PropsWithChildren } from 'react';
import { useAuth } from '../../identity/contexts/auth-context';
import { PresentationRedirect } from './router';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { hasRestoredSession, user } = useAuth();

  if (!hasRestoredSession) {
    return null;
  }

  if (user === null) {
    return <PresentationRedirect to="/identity/sign-in" />;
  }

  return children;
}
