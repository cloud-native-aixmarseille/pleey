import { useEffect, useRef, useState } from 'react';
import { usePresentationTranslation } from '../../../i18n/use-presentation-translation';
import { useKeyboardShortcut, useShortcutScope } from '../../../keyboard';
import { AppIcon } from '../../icons/app-icon';
import { AccountMenuPreferencesPanel } from './account-menu-preferences-panel';
import {
  AccountMenuDropdown,
  AccountMenuTriggerButton,
  AccountMenuWrapper,
} from './account-menu-primitives';

const GUEST_PREFERENCES_SCOPE = 'guest-preferences-menu';

export function GuestPreferencesMenu() {
  const { t } = usePresentationTranslation();
  const [opened, setOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        </AccountMenuDropdown>
      ) : null}
    </AccountMenuWrapper>
  );
}
