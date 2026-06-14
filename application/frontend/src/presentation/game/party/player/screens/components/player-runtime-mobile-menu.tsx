import type { CSSProperties, ReactNode } from 'react';
import { Button } from '../../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import {
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuLabel,
} from '../../../../../shared/ui/overlay/dropdown-menu';
import { ProtectedLeavePartyAction } from '../../../shared/screens/components/protected-leave-party-action';

const MENU_TRIGGER_SIZE_REM = '2.25rem';

type ButtonRootStyle = CSSProperties &
  Partial<
    Record<
      '--button-bd' | '--button-bg' | '--button-color' | '--button-hover' | '--button-hover-color',
      string
    >
  >;

const menuTriggerBaseStyle: ButtonRootStyle = {
  '--button-bd': `1px solid ${uiThemeTokens.color.border.subtle}`,
  '--button-bg': uiThemeTokens.color.surface.panel,
  '--button-color': uiThemeTokens.color.text.primary,
  '--button-hover': uiThemeTokens.color.surface.recessed,
  '--button-hover-color': uiThemeTokens.color.text.primary,
  background: uiThemeTokens.color.surface.panel,
  borderRadius: uiThemeTokens.radius.pill,
  boxShadow: uiThemeTokens.shadow.subtle,
  height: MENU_TRIGGER_SIZE_REM,
  position: 'absolute',
  right: 'max(0.5rem, env(safe-area-inset-right))',
  zIndex: 5,
};

const menuTimerSlotStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  padding: `${uiThemeTokens.spacing.xs} ${uiThemeTokens.spacing.sm}`,
};

const menuLeaveActionSlotStyle: CSSProperties = {
  padding: `${uiThemeTokens.spacing.xxs} ${uiThemeTokens.spacing.xs}`,
};

interface PlayerRuntimeMobileMenuProps {
  readonly ariaLabel: string;
  readonly cancelLeaveLabel: string;
  readonly confirmLeaveLabel: string;
  readonly inlineStatus?: ReactNode;
  readonly leaveDialogMessage: string;
  readonly leaveDialogTitle: string;
  readonly leaveLabel: string;
  readonly menuLabel: ReactNode;
  readonly onLeaveParty: () => void;
  readonly timerBarHeightPx?: number;
  readonly timerSlot?: ReactNode;
}

function resolveMenuTriggerStyle({
  hasInlineStatus,
  timerBarHeightPx,
}: {
  readonly hasInlineStatus: boolean;
  readonly timerBarHeightPx?: number;
}): ButtonRootStyle {
  return {
    ...menuTriggerBaseStyle,
    gap: hasInlineStatus ? '0.25rem' : undefined,
    minWidth: hasInlineStatus ? MENU_TRIGGER_SIZE_REM : undefined,
    padding: hasInlineStatus ? '0 0.5rem' : undefined,
    top:
      timerBarHeightPx === undefined
        ? 'max(0.5rem, env(safe-area-inset-top))'
        : `calc(${timerBarHeightPx}px + max(0.5rem, env(safe-area-inset-top)))`,
    width: hasInlineStatus ? undefined : MENU_TRIGGER_SIZE_REM,
  };
}

export function PlayerRuntimeMobileMenu({
  ariaLabel,
  cancelLeaveLabel,
  confirmLeaveLabel,
  inlineStatus,
  leaveDialogMessage,
  leaveDialogTitle,
  leaveLabel,
  menuLabel,
  onLeaveParty,
  timerBarHeightPx,
  timerSlot,
}: PlayerRuntimeMobileMenuProps) {
  return (
    <DropdownMenu
      trigger={
        <Button
          aria-label={ariaLabel}
          intent="ghost"
          rootStyle={resolveMenuTriggerStyle({
            hasInlineStatus: inlineStatus !== undefined,
            timerBarHeightPx,
          })}
          size="sm"
          type="button"
        >
          {inlineStatus}
          <AppIcon name="menu" size={20} />
        </Button>
      }
    >
      <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
      {timerSlot ? <div style={menuTimerSlotStyle}>{timerSlot}</div> : null}
      <DropdownMenuDivider />
      <div style={menuLeaveActionSlotStyle}>
        <ProtectedLeavePartyAction
          cancelLabel={cancelLeaveLabel}
          confirmLabel={confirmLeaveLabel}
          dialogMessage={leaveDialogMessage}
          dialogTitle={leaveDialogTitle}
          leaveLabel={leaveLabel}
          onLeaveParty={onLeaveParty}
        />
      </div>
    </DropdownMenu>
  );
}
