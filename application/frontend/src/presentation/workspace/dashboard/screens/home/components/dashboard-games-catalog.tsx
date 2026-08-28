import type { GameId } from '../../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { DashboardGameSortField } from '../../../../../../domains/game/management/entities/dashboard-game-list-query';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { FeedbackState, FeedbackStateGate } from '../../../../../shared/ui/feedback/feedback-state-gate';
import { EmptyState } from '../../../../../shared/ui/feedback/state-blocks';
import { ContentStack, ResponsiveGrid } from '../../../../../shared/ui/layout/containers';
import { PaginationBar } from '../../../../shared/components/pagination-bar';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';
import { GameItemCard } from './game-item-card';
import { GameListFilterBar } from './game-list-filter-bar';

interface DashboardGamesCatalogProps {
  readonly creatingPartyGameId: GameId | null;
  readonly filters: GameListFiltersState;
  readonly games: readonly DashboardGameListItem[];
  readonly gamesErrorMessage: string | null;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly gameTypesByKey: ReadonlyMap<GameType, GameTypeDescriptor>;
  readonly hasSelectedProject: boolean;
  readonly isGamesLoading: boolean;
  readonly onCreateParty: (game: DashboardGameListItem) => void;
  readonly onManageGame: (game: DashboardGameListItem) => void;
  readonly onPageChange: (value: number) => void;
  readonly onSearchChange: (value: string) => void;
  readonly onSortDirectionChange: (value: 'asc' | 'desc') => void;
  readonly onSortFieldChange: (value: DashboardGameSortField) => void;
  readonly onTypeFilterChange: (value: GameType[]) => void;
  readonly totalFiltered: number;
  readonly totalGames: number;
  readonly totalPages: number;
}

export function DashboardGamesCatalog({
  creatingPartyGameId,
  filters,
  games,
  gamesErrorMessage,
  gameTypes,
  gameTypesByKey,
  hasSelectedProject,
  isGamesLoading,
  onCreateParty,
  onManageGame,
  onPageChange,
  onSearchChange,
  onSortDirectionChange,
  onSortFieldChange,
  onTypeFilterChange,
  totalFiltered,
  totalGames,
  totalPages,
}: DashboardGamesCatalogProps) {
  const { t } = usePresentationTranslation();
  const gateState = !hasSelectedProject
    ? FeedbackState.PENDING
    : isGamesLoading && totalGames === 0 && games.length === 0
      ? FeedbackState.LOADING
      : totalGames === 0
        ? FeedbackState.EMPTY
        : FeedbackState.READY;

  return (
    <FeedbackStateGate
      emptyLabel={t('dashboard.games.empty')}
      errorMessage={gamesErrorMessage ? t(gamesErrorMessage) : null}
      loadingLabel={t('common.loading')}
      loadingVariant="cards"
      pendingLabel={t('dashboard.games.pending')}
      state={gateState}
    >
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
                key={`${game.type}-${game.gameTypeId ?? game.gameId}`}
                game={game}
                descriptor={gameTypesByKey.get(game.type)}
                isCreatingParty={creatingPartyGameId === game.gameId}
                onCreateParty={onCreateParty}
                onManage={onManageGame}
                showTypeBadge
              />
            ))}
          </ResponsiveGrid>
        )}

        <PaginationBar
          currentPage={filters.page}
          label={t('dashboard.games.pagination.label')}
          nextLabel={t('dashboard.games.pagination.next')}
          onPageChange={onPageChange}
          pageOfLabel={t('dashboard.games.pagination.pageOf', {
            current: String(filters.page),
            total: String(totalPages),
          })}
          previousLabel={t('dashboard.games.pagination.previous')}
          totalPages={totalPages}
        />
      </ContentStack>
    </FeedbackStateGate>
  );
}
