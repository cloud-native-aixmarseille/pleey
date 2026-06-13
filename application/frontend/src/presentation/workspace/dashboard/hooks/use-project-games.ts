import { useEffect, useEffectEvent, useState } from 'react';
import type { DashboardGameListItem } from '../../../../domains/game/management/entities/dashboard-game-list-item';
import type { DashboardGameListPage } from '../../../../domains/game/management/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game/management/entities/dashboard-game-list-query';
import { usePresentationFeedbackChannel } from '../../../shared/ui/feedback/use-presentation-feedback-channel';

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
  readonly reload: () => void;
}

export function useProjectGames({
  query,
  loadGames,
}: UseProjectGamesOptions): UseProjectGamesResult {
  const feedback = usePresentationFeedbackChannel();
  const [games, setGames] = useState<DashboardGameListItem[]>([]);
  const [_reloadVersion, setReloadVersion] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [overallCount, setOverallCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const loadGamesEffect = useEffectEvent(loadGames);

  useEffect(() => {
    if (query === null) {
      setGames([]);
      setTotalCount(0);
      setOverallCount(0);
      setTotalPages(1);
      feedback.clearError();
      return;
    }

    let ignore = false;

    const load = async () => {
      feedback.clearError();
      setIsLoading(true);

      try {
        const loaded = await loadGamesEffect(query);

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
          feedback.handleError(error, {
            fallbackMessage: 'dashboard.errors.loadFailed',
          });
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
  }, [query]);

  const reload = () => {
    setReloadVersion((current) => current + 1);
  };

  return {
    games,
    totalCount,
    overallCount,
    totalPages,
    isLoading,
    errorMessage: feedback.errorMessage,
    reload,
  };
}
