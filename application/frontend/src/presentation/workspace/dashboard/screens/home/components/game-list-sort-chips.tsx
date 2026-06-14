import type { DashboardGameSortField } from '../../../../../../domains/game/management/entities/dashboard-game-list-query';
import { Button } from '../../../../../shared/ui/actions/button';
import type { AppIconName } from '../../../../../shared/ui/icons/app-icon';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import { WrapRow } from '../../../../../shared/ui/layout/containers';

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
    <WrapRow>
      <div aria-label={label} role="group">
        {sortFields.map(({ field, defaultDirection, labelKey }) => {
          const isActive = currentField === field;

          return (
            <Button
              aria-pressed={isActive}
              intent={isActive ? 'secondary' : 'ghost'}
              key={field}
              onClick={() => onToggle(field, defaultDirection)}
              type="button"
              rightSection={
                isActive ? <AppIcon name={sortDirectionIcon(currentDirection)} size={12} /> : null
              }
              size="sm"
            >
              {translate(labelKey)}
            </Button>
          );
        })}
      </div>
    </WrapRow>
  );
}
