import { useEffect, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { isDomainError } from '../../../domains/shared/errors/domain-error';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import type { ThemeId } from '../../../domains/theme/entities/theme-id';
import { ThemeErrorCode } from '../../../domains/theme/errors/theme-error';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';

export function useManagedTheme(organizationId: OrganizationId, themeId: ThemeId) {
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [theme, setTheme] = useState<ManagedTheme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setTheme(null);
    setError(null);
    themeManagementFacade
      .get(organizationId, themeId)
      .then((value) => {
        if (!cancelled) setTheme(value);
      })
      .catch((failure) => {
        if (!cancelled)
          setError(
            isDomainError(failure) && failure.code === ThemeErrorCode.NOT_FOUND
              ? 'theme.errors.notFound'
              : 'theme.builder.loadFailed',
          );
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId, themeId, themeManagementFacade, attempt]);
  return { theme, error, reload: () => setAttempt((value) => value + 1) };
}
