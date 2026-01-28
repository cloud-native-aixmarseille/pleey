import { useEffect, useState } from 'react';
import type { DashboardGameListItem } from '../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardGameListPage } from '../../../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game-catalog/entities/dashboard-game-list-query';

interface UseProjectGamesOptions {
  readonly query: DashboardGameListQuery | null;
  readonly loadGames: (query: DashboardGameListQuery) => Promise<DashboardGameListPage>;
}

interface UseProjectGamesResult {
  readonly games: DashboardGameListItem[];
  readonly totalCount: number;
  readonly overallCount: number;
  readonly totalPages: number;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}

export function useProjectGames({
  query,
  loadGames,
}: UseProjectGamesOptions): UseProjectGamesResult {
  const [games, setGames] = useState<DashboardGameListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [overallCount, setOverallCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query === null) {
      setGames([]);
      setTotalCount(0);
      setOverallCount(0);
      setTotalPages(1);
      setErrorMessage(null);
      return;
    }

    let ignore = false;

    const load = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const loaded = await loadGames(query);

        if (!ignore) {
          setGames([...loaded.items]);
          setTotalCount(loaded.totalCount);
          setOverallCount(loaded.overallCount);
          setTotalPages(loaded.totalPages);
        }
      } catch (error) {
        if (!ignore) {
          setGames([]);
          setTotalCount(0);
          setOverallCount(0);
          setTotalPages(1);
          setErrorMessage(error instanceof Error ? error.message : 'dashboard.errors.loadFailed');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [loadGames, query]);

  return { games, totalCount, overallCount, totalPages, isLoading, errorMessage };
}
