import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { usePresentationNavigate } from '../../../routing/router';

export function useAccountMenuState() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = usePresentationNavigate();
  const [opened, setOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setOpened((current) => !current);
  };

  const close = () => {
    setOpened(false);
  };

  useEffect(() => {
    if (!opened) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        close();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
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
    isAuthenticated,
    opened,
    toggle,
    user,
    wrapperRef,
  };
}
