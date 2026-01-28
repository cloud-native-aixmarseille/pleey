import type { DashboardGameSortField } from '../../../../../../domains/game-catalog/entities/dashboard-game-list-query';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import type { AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';

const chipGroupStyle = {
  alignItems: 'center' as const,
  display: 'flex',
  gap: uiThemeTokens.spacing.xxs,
};

function chipStyle(isActive: boolean) {
  return {
    background: isActive ? uiThemeTokens.color.surface.accentPanel : 'transparent',
    border: `1px solid ${isActive ? uiThemeTokens.color.border.accent : uiThemeTokens.color.border.subtle}`,
    borderRadius: uiThemeTokens.radius.pill,
    color: isActive ? uiThemeTokens.color.text.status : uiThemeTokens.color.text.secondary,
    cursor: 'pointer' as const,
    fontSize: '0.72rem',
    fontWeight: isActive ? 700 : 500,
    letterSpacing: '0.04em',
    lineHeight: 1,
    padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.sm}`,
    transition: `all ${uiThemeTokens.motion.quick}`,
    whiteSpace: 'nowrap' as const,
  };
}

interface GameListSortChipsProps {
  readonly currentDirection: 'asc' | 'desc';
  readonly currentField: DashboardGameSortField;
  readonly label: string;
  readonly onToggle: (field: DashboardGameSortField, defaultDirection: 'asc' | 'desc') => void;
  readonly sortDirectionIcon: (direction: 'asc' | 'desc') => AppIconName;
  readonly sortFields: readonly {
    readonly field: DashboardGameSortField;
    readonly defaultDirection: 'asc' | 'desc';
    readonly labelKey: string;
  }[];
  readonly translate: (key: string) => string;
}

export function GameListSortChips({
  currentDirection,
  currentField,
  label,
  onToggle,
  sortDirectionIcon,
  sortFields,
  translate,
}: GameListSortChipsProps) {
  return (
    <div aria-label={label} role="group" style={chipGroupStyle}>
      {sortFields.map(({ field, defaultDirection, labelKey }) => {
        const isActive = currentField === field;

        return (
          <button
            aria-pressed={isActive}
            key={field}
            onClick={() => onToggle(field, defaultDirection)}
            style={chipStyle(isActive)}
            type="button"
          >
            <span style={{ alignItems: 'center', display: 'inline-flex', gap: '0.3rem' }}>
              {translate(labelKey)}
              {isActive ? <AppIcon name={sortDirectionIcon(currentDirection)} size={12} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
