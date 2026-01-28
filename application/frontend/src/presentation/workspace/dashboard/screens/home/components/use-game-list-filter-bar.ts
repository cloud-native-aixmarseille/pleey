import type { DashboardGameSortField } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import type { AppIconName } from '../../../../../shared/ui/icons/app-icon';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';

const SORT_FIELDS: readonly {
  readonly field: DashboardGameSortField;
  readonly defaultDirection: 'asc' | 'desc';
  readonly labelKey: string;
}[] = [
  { field: 'createdAt', defaultDirection: 'desc', labelKey: 'dashboard.games.filters.sortDate' },
  { field: 'title', defaultDirection: 'asc', labelKey: 'dashboard.games.filters.sortName' },
];

function sortDirectionIcon(direction: 'asc' | 'desc'): AppIconName {
  return direction === 'asc' ? 'sort-asc' : 'sort-desc';
}

interface UseGameListFilterBarParams {
  readonly filters: GameListFiltersState;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly onSortDirectionChange: (value: 'asc' | 'desc') => void;
  readonly onSortFieldChange: (value: DashboardGameSortField) => void;
  readonly translate: (key: string) => string;
}

export function useGameListFilterBar({
  filters,
  gameTypes,
  onSortDirectionChange,
  onSortFieldChange,
  translate,
}: UseGameListFilterBarParams) {
  const handleSortToggle = (field: DashboardGameSortField, defaultDirection: 'asc' | 'desc') => {
    if (filters.sortField === field) {
      onSortDirectionChange(filters.sortDirection === 'asc' ? 'desc' : 'asc');
      return;
    }

    onSortFieldChange(field);
    onSortDirectionChange(defaultDirection);
  };

  const typeSelectData = gameTypes.map((gameType) => ({
    value: gameType.key,
    label: translate(gameType.titleKey),
  }));

  return {
    sortFields: SORT_FIELDS,
    sortDirectionIcon,
    handleSortToggle,
    typeSelectData,
  };
}
