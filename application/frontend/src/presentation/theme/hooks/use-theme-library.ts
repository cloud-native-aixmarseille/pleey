import { useEffect, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { PaginatedResult } from '../../../domains/shared/value-objects/paginated-result';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
export function useThemeLibrary(organizationId: OrganizationId | undefined, active: boolean) {
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<PaginatedResult<ManagedTheme> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    setError(false);
    if (!organizationId || !active) return;
    setIsLoading(true);
    themeManagementFacade
      .list(organizationId, { page, pageSize: 10, search })
      .then((value) => {
        if (!cancelled) setResult(value);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId, active, page, search, revision, themeManagementFacade]);
  return {
    result,
    isLoading,
    error,
    page,
    setPage,
    search,
    setSearch: (value: string) => {
      setPage(1);
      setSearch(value);
    },
    reload: () => setRevision((value) => value + 1),
  };
}
