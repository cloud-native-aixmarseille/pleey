import type { DashboardGameSortField } from '../../../../../../domains/game/management/entities/dashboard-game-list-query';
import { GameType } from '../../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../../domains/game/types/shared/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Input } from '../../../../../shared/ui/forms/input';
import { MultiSelect } from '../../../../../shared/ui/forms/multi-select';
import { SplitWrapRow, WrapRow } from '../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../shared/ui/layout/typography';
import { useWorkspaceDependencies } from '../../../../shared/contexts/workspace-dependencies-context';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';
import { GameListSortChips } from './game-list-sort-chips';
import { useGameListFilterBar } from './use-game-list-filter-bar';

interface GameListFilterBarProps {
  readonly filters: GameListFiltersState;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly onSearchChange: (value: string) => void;
  readonly onSortDirectionChange: (value: 'asc' | 'desc') => void;
  readonly onSortFieldChange: (value: DashboardGameSortField) => void;
  readonly onTypeFilterChange: (value: GameType[]) => void;
  readonly totalFiltered: number;
  readonly totalGames: number;
}

function toGameTypes(
  values: readonly string[],
  gameTypeParser: Pick<
    ReturnType<typeof useWorkspaceDependencies>['gameTypeParser'],
    'parseOrNull'
  >,
): GameType[] {
  return values.flatMap((value) => {
    const gameType = gameTypeParser.parseOrNull(value);

    return gameType === null ? [] : [gameType];
  });
}

export function GameListFilterBar({
  filters,
  gameTypes,
  onSearchChange,
  onSortDirectionChange,
  onSortFieldChange,
  onTypeFilterChange,
  totalFiltered,
  totalGames,
}: GameListFilterBarProps) {
  const { t } = usePresentationTranslation();
  const { gameTypeParser } = useWorkspaceDependencies();
  const { handleSortToggle, sortDirectionIcon, sortFields, typeSelectData } = useGameListFilterBar({
    filters,
    gameTypes,
    onSortDirectionChange,
    onSortFieldChange,
    translate: t,
  });

  return (
    <div aria-label={t('dashboard.games.filters.label')} role="search">
      <SplitWrapRow align="center" gap="sm">
        <WrapRow gap="xs">
          <Input
            aria-label={t('dashboard.games.filters.searchPlaceholder')}
            compact
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('dashboard.games.filters.searchPlaceholder')}
            type="search"
            value={filters.search}
          />
          <MultiSelect
            aria-label={t('dashboard.games.filters.typeLabel')}
            clearable
            data={typeSelectData}
            onChange={(value) => onTypeFilterChange(toGameTypes(value, gameTypeParser))}
            placeholder={t('dashboard.games.filters.allTypes')}
            size="xs"
            value={[...filters.typeFilter]}
          />
        </WrapRow>

        <WrapRow gap="xs">
          <GameListSortChips
            currentDirection={filters.sortDirection}
            currentField={filters.sortField}
            label={t('dashboard.games.filters.sortLabel')}
            onToggle={handleSortToggle}
            sortDirectionIcon={sortDirectionIcon}
            sortFields={sortFields}
            translate={t}
          />
          <SupportingText tone="soft">
            {t('dashboard.games.filters.showing', {
              count: String(totalFiltered),
              total: String(totalGames),
            })}
          </SupportingText>
        </WrapRow>
      </SplitWrapRow>
    </div>
  );
}
