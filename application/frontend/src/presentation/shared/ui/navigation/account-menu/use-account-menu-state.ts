import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { useKeyboardShortcut, useShortcutScope } from '../../../keyboard';
import { usePresentationNavigate } from '../../../routing/router';

const ACCOUNT_MENU_SHORTCUT_SCOPE = 'account-menu';
const ACCOUNT_MENU_GLOBAL_SHORTCUT_SCOPE = 'global';

export function useAccountMenuState() {
  const { user, signOut } = useAuth();
  const navigate = usePresentationNavigate();
  const [opened, setOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setOpened((current) => !current);
  };

  const close = () => {
    setOpened(false);
  };

  const toggleGlobalAccountMenu = () => {
    setOpened((current) => !current);
  };

  useShortcutScope(ACCOUNT_MENU_SHORTCUT_SCOPE, { active: opened, priority: 200 });

  useKeyboardShortcut({
    combo: { key: 'u' },
    descriptionKey: 'shared.keyboard.toggleAccountMenu',
    disabled: user === null,
    execute: toggleGlobalAccountMenu,
    id: 'toggle-account-menu',
    scope: ACCOUNT_MENU_GLOBAL_SHORTCUT_SCOPE,
    scopeLabelKey: 'shared.keyboard.globalGroup',
  });

  useKeyboardShortcut({
    combo: { key: 'Escape' },
    descriptionKey: 'shared.keyboard.dismiss',
    disabled: !opened,
    execute: close,
    id: 'close-account-menu',
    scope: ACCOUNT_MENU_SHORTCUT_SCOPE,
    scopeLabelKey: 'shared.shell.accountMenu',
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
  }, [opened]);

  return {
    close,
    handleNavigateToProfile: () => {
      navigate('/identity/profile');
      close();
    },
    handleSignIn: () => {
      navigate('/identity/sign-in');
    },
    handleSignOut: () => {
      signOut();
      close();
    },
    opened,
    toggle,
    user,
    wrapperRef,
  };
}
