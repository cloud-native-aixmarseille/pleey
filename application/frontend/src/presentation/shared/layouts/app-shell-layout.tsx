import { useEffect, useEffectEvent, useState } from 'react';
import { useAuth } from '../../identity/contexts/auth-context';
import { Outlet } from '../routing/router';
import { AppShellHeader } from './app-shell-header';
import { mainContentStyle, shellContentStyle, shellMainStyle } from './app-shell-layout.styles';

/* ── Shell layout ── */

interface AppShellLayoutProps {
  readonly loadAppVersion?: () => Promise<string>;
}

export function AppShellLayout({ loadAppVersion }: AppShellLayoutProps) {
  const { user } = useAuth();
  const isAuthenticated = user !== null;
  const [appVersion, setAppVersion] = useState('');
  const [navOpened, setNavOpened] = useState(false);
  const normalizedAppVersion = appVersion.trim();
  const loadAppVersionEffect = useEffectEvent(async () => {
    if (!loadAppVersion) {
      return '';
    }

    return loadAppVersion();
  });

  useEffect(() => {
    if (!loadAppVersion) {
      setAppVersion('');
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const nextAppVersion = await loadAppVersionEffect();

        if (!ignore) {
          setAppVersion(nextAppVersion.trim());
        }
      } catch {
        if (!ignore) {
          setAppVersion('');
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [loadAppVersion]);

  const toggleNav = () => {
    setNavOpened((isOpen) => !isOpen);
  };

  const closeNav = () => {
    setNavOpened(false);
  };

  return (
    <div style={shellMainStyle}>
      <AppShellHeader
        appVersion={normalizedAppVersion}
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
