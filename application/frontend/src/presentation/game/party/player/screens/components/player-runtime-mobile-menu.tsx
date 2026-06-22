import type { ReactNode } from 'react';
import { IconTriggerButton } from '../../../../../shared/ui/actions/icon-trigger-button';
import { AppIcon } from '../../../../../shared/ui/icons/app-icon';
import {
  DropdownMenu,
  DropdownMenuDivider,
  DropdownMenuLabel,
} from '../../../../../shared/ui/overlay/dropdown-menu';
import { ProtectedLeavePartyAction } from '../../../shared/screens/components/protected-leave-party-action';
import {
  menuLeaveActionSlotStyle,
  menuTimerSlotStyle,
  resolveMenuTriggerStyle,
} from './player-runtime-mobile-menu.styles';

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
  const triggerStyle = resolveMenuTriggerStyle({
    hasInlineStatus: inlineStatus !== undefined,
    timerBarHeightPx,
  });

  return (
    <DropdownMenu
      trigger={
        <IconTriggerButton
          aria-label={ariaLabel}
          floating={{
            right: 'max(0.5rem, env(safe-area-inset-right))',
            top: triggerStyle.top,
            zIndex: 5,
          }}
          minWidth={triggerStyle.minWidth}
          paddingX={inlineStatus !== undefined ? '0.5rem' : undefined}
          shadow="subtle"
          surface="panel"
        >
          {inlineStatus}
          <AppIcon name="menu" size={20} />
        </IconTriggerButton>
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
