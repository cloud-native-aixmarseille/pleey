import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ThemePermissions } from '../../../domains/theme/value-objects/theme-permissions';
import { useAuth } from '../../identity/contexts/auth-context';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';

export function useThemePermissions(organizationId: OrganizationId) {
  const { user } = useAuth();
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [result, setResult] = useState<{ scope: string; permissions: ThemePermissions } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const generation = useRef(0);
  const scope = `${user?.id ?? ''}/${organizationId}`;
  const refresh = () => {
    generation.current += 1;
    setResult(null);
    setError(false);
    setAttempt((value) => value + 1);
  };
  useEffect(() => {
    let cancelled = false;
    const request = ++generation.current;
    setResult(null);
    setError(false);
    themeManagementFacade
      .permissions(organizationId)
      .then((permissions) => {
        if (!cancelled && generation.current === request) setResult({ scope, permissions });
      })
      .catch(() => {
        if (!cancelled && generation.current === request) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, organizationId, themeManagementFacade, attempt]);
  const refreshOnResume = useEffectEvent(refresh);
  useEffect(() => {
    window.addEventListener('focus', refreshOnResume);
    window.addEventListener('online', refreshOnResume);
    return () => {
      window.removeEventListener('focus', refreshOnResume);
      window.removeEventListener('online', refreshOnResume);
    };
  }, []);
  return { permissions: result?.scope === scope ? result.permissions : null, error, refresh };
}
