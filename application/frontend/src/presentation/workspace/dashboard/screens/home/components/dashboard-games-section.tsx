import type { DashboardGameListItem } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { DashboardGameSortField } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import {
  EmptyState,
  LoadingState,
  PendingState,
} from '../../../../../shared/ui/feedback/state-blocks';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { ContentStack, ResponsiveGrid } from '../../../../../shared/ui/layout/containers';
import { SectionCard } from '../../../../../shared/ui/layout/section-card';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';
import { GameItemCard } from './game-item-card';
import { GameListFilterBar } from './game-list-filter-bar';
import { PaginationBar } from './pagination-bar';

interface DashboardGamesSectionProps {
  readonly hasSelectedProject: boolean;
  readonly games: readonly DashboardGameListItem[];
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly gameTypesByKey: ReadonlyMap<string, GameTypeDescriptor>;
  readonly filters: GameListFiltersState;
  readonly isGamesLoading: boolean;
  readonly isLaunchDisabled: boolean;
  readonly launchDisabledReason: string | null;
  readonly gamesErrorMessage: string | null;
  readonly totalFiltered: number;
  readonly totalGames: number;
  readonly totalPages: number;
  readonly onSearchChange: (value: string) => void;
  readonly onTypeFilterChange: (value: string[]) => void;
  readonly onSortFieldChange: (value: DashboardGameSortField) => void;
  readonly onSortDirectionChange: (value: 'asc' | 'desc') => void;
  readonly onPageChange: (value: number) => void;
  readonly onLaunchSession: (game: DashboardGameListItem) => void;
  readonly onManageGame: (game: DashboardGameListItem) => void;
}

export function DashboardGamesSection({
  hasSelectedProject,
  games,
  gameTypes,
  gameTypesByKey,
  filters,
  isGamesLoading,
  isLaunchDisabled,
  launchDisabledReason,
  gamesErrorMessage,
  totalFiltered,
  totalGames,
  totalPages,
  onSearchChange,
  onTypeFilterChange,
  onSortFieldChange,
  onSortDirectionChange,
  onPageChange,
  onLaunchSession,
  onManageGame,
}: DashboardGamesSectionProps) {
  const { t } = usePresentationTranslation();
  const isInitialLoading = isGamesLoading && totalGames === 0 && games.length === 0;

  return (
    <SectionCard title={t('dashboard.games.title')}>
      <StatusBanner tone="error">{gamesErrorMessage ? t(gamesErrorMessage) : null}</StatusBanner>

      {!hasSelectedProject ? (
        <PendingState>{t('dashboard.games.pending')}</PendingState>
      ) : isInitialLoading ? (
        <LoadingState variant="cards">{t('common.loading')}</LoadingState>
      ) : totalGames === 0 ? (
        <EmptyState>{t('dashboard.games.empty')}</EmptyState>
      ) : (
        <ContentStack gap="md">
          <GameListFilterBar
            filters={filters}
            gameTypes={gameTypes}
            onSearchChange={onSearchChange}
            onSortDirectionChange={onSortDirectionChange}
            onSortFieldChange={onSortFieldChange}
            onTypeFilterChange={onTypeFilterChange}
            totalFiltered={totalFiltered}
            totalGames={totalGames}
          />

          {games.length === 0 ? (
            <EmptyState>{t('dashboard.games.filters.noResults')}</EmptyState>
          ) : (
            <ResponsiveGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="md">
              {games.map((game) => (
                <GameItemCard
                  key={`${game.type}-${game.relatedGameId ?? game.gameId}`}
                  game={game}
                  descriptor={gameTypesByKey.get(game.type)}
                  isLaunchDisabled={isLaunchDisabled}
                  launchDisabledReason={launchDisabledReason ?? undefined}
                  onLaunchSession={onLaunchSession}
                  onManage={onManageGame}
                  showTypeBadge
                />
              ))}
            </ResponsiveGrid>
          )}

          <PaginationBar
            currentPage={filters.page}
            onPageChange={onPageChange}
            totalPages={totalPages}
          />
        </ContentStack>
      )}
    </SectionCard>
  );
}
