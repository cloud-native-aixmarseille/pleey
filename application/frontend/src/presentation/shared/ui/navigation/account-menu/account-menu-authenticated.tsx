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
  AccountMenuExternalAnchor,
  AccountMenuFooter,
  AccountMenuFooterLink,
  AccountMenuMetaText,
  AccountMenuTriggerButton,
  AccountMenuUsername,
  AccountMenuWrapper,
} from './account-menu-primitives';

interface AccountMenuAuthenticatedProps {
  readonly appVersion?: string;
  readonly feedbackUrl: string;
  readonly onNavigateToProfile: () => void;
  readonly onSignOut: () => void;
  readonly onToggle: () => void;
  readonly opened: boolean;
  readonly user: User;
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
}

export function AccountMenuAuthenticated({
  appVersion = '',
  feedbackUrl,
  onNavigateToProfile,
  onSignOut,
  onToggle,
  opened,
  user,
  wrapperRef,
}: AccountMenuAuthenticatedProps) {
  const { t } = usePresentationTranslation();
  const normalizedAppVersion = appVersion.trim();
  const normalizedFeedbackUrl = feedbackUrl.trim();

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
          {normalizedAppVersion.length > 0 || normalizedFeedbackUrl.length > 0 ? (
            <>
              <AccountMenuDivider />
              {normalizedAppVersion.length > 0 && normalizedFeedbackUrl.length > 0 ? (
                <AccountMenuFooter>
                  <AccountMenuMetaText>
                    {t('shared.shell.version', { version: normalizedAppVersion })}
                  </AccountMenuMetaText>
                  <AccountMenuFooterLink href={normalizedFeedbackUrl} label={t('shared.shell.feedbackLink')}>
                    <AccountMenuActionRow>
                      <AppIcon name="github" size={14} />
                      <span>{t('shared.shell.feedbackAction')}</span>
                    </AccountMenuActionRow>
                  </AccountMenuFooterLink>
                </AccountMenuFooter>
              ) : normalizedAppVersion.length > 0 ? (
                <AccountMenuMetaText>
                  {t('shared.shell.version', { version: normalizedAppVersion })}
                </AccountMenuMetaText>
              ) : (
                <AccountMenuExternalAnchor href={normalizedFeedbackUrl}>
                  <AccountMenuActionRow>
                    <AppIcon name="github" size={16} />
                    <span>{t('shared.shell.feedbackLink')}</span>
                  </AccountMenuActionRow>
                </AccountMenuExternalAnchor>
              )}
            </>
          ) : null}
        </AccountMenuDropdown>
      ) : null}
    </AccountMenuWrapper>
  );
}
