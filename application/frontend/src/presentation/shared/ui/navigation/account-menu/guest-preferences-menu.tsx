import { useEffect, useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { useKeyboardShortcut, useShortcutScope } from '../../../keyboard';
import { AppIcon } from '../../icons/app-icon';
import { AccountMenuPreferencesPanel } from './account-menu-preferences-panel';
import {
  AccountMenuDivider,
  AccountMenuDropdown,
  AccountMenuMetaText,
  AccountMenuTriggerButton,
  AccountMenuWrapper,
} from './account-menu-primitives';

const GUEST_PREFERENCES_SCOPE = 'guest-preferences-menu';

interface GuestPreferencesMenuProps {
  readonly appVersion?: string;
}

export function GuestPreferencesMenu({ appVersion = '' }: GuestPreferencesMenuProps) {
  const { t } = usePresentationTranslation();
  const [opened, setOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const normalizedAppVersion = appVersion.trim();

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
          {normalizedAppVersion.length > 0 ? (
            <>
              <AccountMenuDivider />
              <AccountMenuMetaText>{t('shared.shell.version', { version: normalizedAppVersion })}</AccountMenuMetaText>
            </>
          ) : null}
        </AccountMenuDropdown>
      ) : null}
    </AccountMenuWrapper>
  );
}
