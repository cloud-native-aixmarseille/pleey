import type { User } from '../../../../../domains/identity/entities/user';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { UserAvatar } from '../../data/user-avatar';
import { AppIcon } from '../../icons/app-icon';
import { AccountMenuPreferencesPanel } from './account-menu-preferences-panel';
import {
  AccountMenuActionButton,
  AccountMenuActionRow,
  AccountMenuDivider,
  AccountMenuDropdown,
  AccountMenuTriggerButton,
  AccountMenuUsername,
  AccountMenuWrapper,
} from './account-menu-primitives';

interface AccountMenuAuthenticatedProps {
  readonly onNavigateToProfile: () => void;
  readonly onSignOut: () => void;
  readonly onToggle: () => void;
  readonly opened: boolean;
  readonly user: User;
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
}

export function AccountMenuAuthenticated({
  onNavigateToProfile,
  onSignOut,
  onToggle,
  opened,
  user,
  wrapperRef,
}: AccountMenuAuthenticatedProps) {
  const { t } = usePresentationTranslation();

  return (
    <AccountMenuWrapper wrapperRef={wrapperRef}>
      <AccountMenuTriggerButton
        aria-expanded={opened}
        aria-haspopup="menu"
        aria-label={t('shared.shell.accountMenu')}
        aria-keyshortcuts="u"
        onClick={onToggle}
      >
        <UserAvatar alt={user.username} size={28} src={user.avatarUri} />
        <AccountMenuUsername>{user.username}</AccountMenuUsername>
        <AppIcon name="chevron-down" size={16} />
      </AccountMenuTriggerButton>

      {opened ? (
        <AccountMenuDropdown>
          <AccountMenuActionButton onClick={onNavigateToProfile} role="menuitem">
            <AccountMenuActionRow>
              <AppIcon name="profile" size={16} />
              <span>{t('shared.shell.profileLink')}</span>
            </AccountMenuActionRow>
          </AccountMenuActionButton>
          <AccountMenuActionButton danger onClick={onSignOut} role="menuitem">
            <AccountMenuActionRow>
              <AppIcon name="sign-out" size={16} />
              <span>{t('shared.shell.signOutAction')}</span>
            </AccountMenuActionRow>
          </AccountMenuActionButton>
          <AccountMenuDivider />
          <AccountMenuPreferencesPanel />
        </AccountMenuDropdown>
      ) : null}
    </AccountMenuWrapper>
  );
}
