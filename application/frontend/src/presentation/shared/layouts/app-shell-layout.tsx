import { useState } from 'react';
import { useAuth } from '../../identity/contexts/auth-context';
import { Outlet } from '../routing/router';
import { AppShellHeader } from './app-shell-header';
import { mainContentStyle, shellContentStyle, shellMainStyle } from './app-shell-layout.styles';

/* ── Shell layout ── */

export function AppShellLayout() {
  const { user } = useAuth();
  const isAuthenticated = user !== null;
  const [navOpened, setNavOpened] = useState(false);

  const toggleNav = () => {
    setNavOpened((isOpen) => !isOpen);
  };

  const closeNav = () => {
    setNavOpened(false);
  };

  return (
    <div style={shellMainStyle}>
      <AppShellHeader
        isAuthenticated={isAuthenticated}
        navHandlers={{ toggle: toggleNav, close: closeNav }}
        navOpened={navOpened}
      />

      <main style={shellContentStyle}>
        <div style={mainContentStyle}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
