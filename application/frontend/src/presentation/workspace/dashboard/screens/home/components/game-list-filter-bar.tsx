import type { DashboardGameSortField } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { GameTypeDescriptor } from '../../../../../../domains/game-catalog/entities/game-type-catalog';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { MultiSelect } from '../../../../../shared/ui/forms/multi-select';
import { surfaceRecipes } from '../../../../../shared/ui/foundation/ui-recipes';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import type { GameListFiltersState } from '../../../hooks/use-game-list-filters';
import { GameListSortChips } from './game-list-sort-chips';
import { useGameListFilterBar } from './use-game-list-filter-bar';

interface GameListFilterBarProps {
  readonly filters: GameListFiltersState;
  readonly gameTypes: readonly GameTypeDescriptor[];
  readonly onSearchChange: (value: string) => void;
  readonly onSortDirectionChange: (value: 'asc' | 'desc') => void;
  readonly onSortFieldChange: (value: DashboardGameSortField) => void;
  readonly onTypeFilterChange: (value: string[]) => void;
  readonly totalFiltered: number;
  readonly totalGames: number;
}

const barStyle = {
  ...surfaceRecipes.inset,
  alignItems: 'center' as const,
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: uiThemeTokens.spacing.xs,
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
};

const searchWrapperStyle = {
  alignItems: 'center' as const,
  background: uiThemeTokens.color.surface.field,
  border: `1px solid ${uiThemeTokens.color.border.subtle}`,
  borderRadius: uiThemeTokens.radius.pill,
  color: uiThemeTokens.color.text.secondary,
  display: 'flex',
  flex: 1,
  gap: uiThemeTokens.spacing.xs,
  minWidth: '10rem',
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm}`,
  transition: `border-color ${uiThemeTokens.motion.quick}`,
};

const searchInputStyle = {
  background: 'transparent',
  border: 'none',
  color: uiThemeTokens.color.text.primary,
  flex: 1,
  fontSize: '0.85rem',
  outline: 'none',
  padding: 0,
  width: '100%',
};

const separatorStyle = {
  background: uiThemeTokens.color.border.subtle,
  height: '1.4rem',
  width: '1px',
};

const countStyle = {
  color: uiThemeTokens.color.text.quiet,
  fontSize: '0.75rem',
  marginLeft: 'auto',
  whiteSpace: 'nowrap' as const,
};

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
  const { handleSortToggle, sortDirectionIcon, sortFields, typeSelectData } = useGameListFilterBar({
    filters,
    gameTypes,
    onSortDirectionChange,
    onSortFieldChange,
    translate: t,
  });

  return (
    <div aria-label={t('dashboard.games.filters.label')} role="search" style={barStyle}>
      <div style={searchWrapperStyle}>
        <AppIcon name="catalog" size={14} />
        <input
          aria-label={t('dashboard.games.filters.searchPlaceholder')}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('dashboard.games.filters.searchPlaceholder')}
          style={searchInputStyle}
          type="search"
          value={filters.search}
        />
      </div>

      <div aria-hidden style={separatorStyle} />

      <MultiSelect
        aria-label={t('dashboard.games.filters.typeLabel')}
        clearable
        data={typeSelectData}
        onChange={onTypeFilterChange}
        placeholder={t('dashboard.games.filters.allTypes')}
        size="xs"
        style={{ minWidth: '10rem' }}
        value={[...filters.typeFilter]}
      />

      <div aria-hidden style={separatorStyle} />

      <GameListSortChips
        currentDirection={filters.sortDirection}
        currentField={filters.sortField}
        label={t('dashboard.games.filters.sortLabel')}
        onToggle={handleSortToggle}
        sortDirectionIcon={sortDirectionIcon}
        sortFields={sortFields}
        translate={t}
      />

      <span style={countStyle}>
        {t('dashboard.games.filters.showing', {
          count: String(totalFiltered),
          total: String(totalGames),
        })}
      </span>
    </div>
  );
}
