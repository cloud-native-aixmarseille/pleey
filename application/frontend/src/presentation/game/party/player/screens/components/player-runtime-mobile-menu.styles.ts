import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';

const MENU_TRIGGER_SIZE_REM = '2.25rem';

export const menuTimerSlotStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
} as const;

export const menuLeaveActionSlotStyle = {
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xs}`,
} as const;

export function resolveMenuTriggerStyle({
  hasInlineStatus,
  timerBarHeightPx,
}: {
  readonly hasInlineStatus: boolean;
  readonly timerBarHeightPx?: number;
}) {
  return {
    minWidth: hasInlineStatus ? MENU_TRIGGER_SIZE_REM : undefined,
    top:
      timerBarHeightPx === undefined
        ? 'max(0.5rem, env(safe-area-inset-top))'
        : `calc(${timerBarHeightPx}px + max(0.5rem, env(safe-area-inset-top)))`,
    width: hasInlineStatus ? undefined : MENU_TRIGGER_SIZE_REM,
  };
}
