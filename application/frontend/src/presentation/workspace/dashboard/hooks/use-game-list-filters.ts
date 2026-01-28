import { useCallback, useMemo, useState } from 'react';
import type {
  DashboardGameSortDirection,
  DashboardGameSortField,
} from '../../../../domains/game-catalog/entities/dashboard-game-list-query';

export interface GameListFiltersState {
  readonly search: string;
  readonly typeFilter: readonly string[];
  readonly sortField: DashboardGameSortField;
  readonly sortDirection: DashboardGameSortDirection;
  readonly page: number;
  readonly pageSize: number;
}

interface UseGameListFiltersResult {
  readonly filters: GameListFiltersState;
  readonly setSearch: (value: string) => void;
  readonly setTypeFilter: (value: string[]) => void;
  readonly setSortField: (value: DashboardGameSortField) => void;
  readonly setSortDirection: (value: DashboardGameSortDirection) => void;
  readonly setPage: (value: number) => void;
}

const DEFAULT_PAGE_SIZE = 9;

export function useGameListFilters(pageSize = DEFAULT_PAGE_SIZE): UseGameListFiltersResult {
  const [search, setSearchRaw] = useState('');
  const [typeFilter, setTypeFilterRaw] = useState<string[]>([]);
  const [sortField, setSortFieldRaw] = useState<DashboardGameSortField>('createdAt');
  const [sortDirection, setSortDirectionRaw] = useState<DashboardGameSortDirection>('desc');
  const [page, setPage] = useState(1);

  const resetPage = useCallback(() => setPage(1), []);

  const setSearch = useCallback(
    (value: string) => {
      setSearchRaw(value);
      resetPage();
    },
    [resetPage],
  );

  const setTypeFilter = useCallback(
    (value: string[]) => {
      setTypeFilterRaw(value);
      resetPage();
    },
    [resetPage],
  );

  const setSortField = useCallback(
    (value: DashboardGameSortField) => {
      setSortFieldRaw(value);
      resetPage();
    },
    [resetPage],
  );

  const setSortDirection = useCallback(
    (value: DashboardGameSortDirection) => {
      setSortDirectionRaw(value);
      resetPage();
    },
    [resetPage],
  );

  const filters = useMemo(
    () => ({
      search,
      typeFilter,
      sortField,
      sortDirection,
      page,
      pageSize,
    }),
    [page, pageSize, search, sortDirection, sortField, typeFilter],
  );

  return {
    filters,
    setSearch,
    setTypeFilter,
    setSortField,
    setSortDirection,
    setPage,
  };
}
