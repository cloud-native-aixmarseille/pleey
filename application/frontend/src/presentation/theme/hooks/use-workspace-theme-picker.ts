import { useCallback, useEffect, useState } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import { usePresentationDebouncedValue } from '../../shared/hooks/use-presentation-debounced-value';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';

const PAGE_SIZE = 10;

function mergeById(previous: readonly ManagedTheme[], next: readonly ManagedTheme[]): ManagedTheme[] {
  const byId = new Map(previous.map((theme) => [theme.id, theme]));
  for (const theme of next) {
    byId.set(theme.id, theme);
  }
  return [...byId.values()];
}

export function useWorkspaceThemePicker(organizationId: OrganizationId | undefined) {
  const { themeManagementFacade } = useWorkspaceDependencies();
  const [active, setActive] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = usePresentationDebouncedValue(search);
  const [items, setItems] = useState<ManagedTheme[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [organizationId, debouncedSearch, revision, active]);

  useEffect(() => {
    if (!organizationId || !active) {
      return;
    }

    let cancelled = false;
    const isFirstPage = page === 1;

    if (isFirstPage) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(false);

    themeManagementFacade
      .list(organizationId, { page, pageSize: PAGE_SIZE, search: debouncedSearch })
      .then((result) => {
        if (cancelled) return;
        setTotalPages(result.totalPages);
        setItems((previous) => (isFirstPage ? [...result.items] : mergeById(previous, result.items)));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId, active, debouncedSearch, page, revision, themeManagementFacade]);

  const open = useCallback(() => {
    setActive(true);
    setRevision((value) => value + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    setPage((current) => (current < totalPages ? current + 1 : current));
  }, [isLoading, isLoadingMore, totalPages]);

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore: page < totalPages,
    search,
    setSearch,
    open,
    loadMore,
  };
}
