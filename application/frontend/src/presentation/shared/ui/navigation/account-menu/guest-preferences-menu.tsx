import { useEffect, useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { useKeyboardShortcut, useShortcutScope } from '../../../keyboard';
import { AppIcon } from '../../icons/app-icon';
import { AccountMenuPreferencesPanel } from './account-menu-preferences-panel';
import {
  AccountMenuActionRow,
  AccountMenuDivider,
  AccountMenuDropdown,
  AccountMenuExternalAnchor,
  AccountMenuFooter,
  AccountMenuFooterLink,
  AccountMenuMetaText,
  AccountMenuTriggerButton,
  AccountMenuWrapper,
} from './account-menu-primitives';

const GUEST_PREFERENCES_SCOPE = 'guest-preferences-menu';

interface GuestPreferencesMenuProps {
  readonly appVersion?: string;
  readonly feedbackUrl: string;
}

export function GuestPreferencesMenu({ appVersion = '', feedbackUrl }: GuestPreferencesMenuProps) {
  const { t } = usePresentationTranslation();
  const [opened, setOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const normalizedAppVersion = appVersion.trim();
  const normalizedFeedbackUrl = feedbackUrl.trim();

  const toggle = () => {
    setOpened((current) => !current);
  };

  const close = () => {
    setOpened(false);
  };

  useShortcutScope(GUEST_PREFERENCES_SCOPE, { active: opened, priority: 180 });

  useKeyboardShortcut({
    combo: { key: 'Escape' },
    descriptionKey: 'shared.keyboard.dismiss',
    disabled: !opened,
    execute: close,
    id: 'close-guest-preferences-menu',
    scope: GUEST_PREFERENCES_SCOPE,
    scopeLabelKey: 'shared.shell.preferencesMenu',
  });

  useEffect(() => {
    if (!opened) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [opened, close]);

  return (
    <AccountMenuWrapper wrapperRef={wrapperRef}>
      <AccountMenuTriggerButton
        aria-expanded={opened}
        aria-haspopup="menu"
        aria-label={t('shared.shell.preferencesMenu')}
        onClick={toggle}
      >
        <AppIcon name="settings" size={16} />
      </AccountMenuTriggerButton>

      {opened ? (
        <AccountMenuDropdown>
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
