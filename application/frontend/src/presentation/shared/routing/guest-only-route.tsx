import type { PropsWithChildren } from 'react';
import { useAuth } from '../../identity/contexts/auth-context';
import { PresentationRedirect } from './router';

export function GuestOnlyRoute({ children }: PropsWithChildren) {
  const { hasRestoredSession, user } = useAuth();

  if (!hasRestoredSession) {
    return null;
  }

  if (user !== null) {
    return <PresentationRedirect replace to="/workspace/dashboard" />;
  }

  return children;
}
