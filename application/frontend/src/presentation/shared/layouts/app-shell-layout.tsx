import { useEffect, useEffectEvent, useState } from 'react';
import type { ApplicationShellConfig } from '../../../application/shared/ports/application-shell-config.port';
import { useAuth } from '../../identity/contexts/auth-context';
import { Outlet } from '../routing/router';
import { AppShellHeader } from './app-shell-header';
import { mainContentStyle, shellContentStyle, shellMainStyle } from './app-shell-layout.styles';

/* ── Shell layout ── */

interface AppShellLayoutProps {
  readonly loadShellConfig?: () => Promise<ApplicationShellConfig>;
}

const EMPTY_SHELL_CONFIG: ApplicationShellConfig = {
  appVersion: '',
  feedbackUrl: '',
};

export function AppShellLayout({ loadShellConfig }: AppShellLayoutProps) {
  const { user } = useAuth();
  const isAuthenticated = user !== null;
  const [shellConfig, setShellConfig] = useState<ApplicationShellConfig>(EMPTY_SHELL_CONFIG);
  const [navOpened, setNavOpened] = useState(false);
  const normalizedAppVersion = shellConfig.appVersion.trim();
  const normalizedFeedbackUrl = shellConfig.feedbackUrl.trim();
  const loadShellConfigEffect = useEffectEvent(async () => {
    if (!loadShellConfig) {
      return EMPTY_SHELL_CONFIG;
    }

    return loadShellConfig();
  });

  useEffect(() => {
    if (!loadShellConfig) {
      setShellConfig(EMPTY_SHELL_CONFIG);
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const nextShellConfig = await loadShellConfigEffect();

        if (!ignore) {
          setShellConfig({
            appVersion: nextShellConfig.appVersion.trim(),
            feedbackUrl: nextShellConfig.feedbackUrl.trim(),
          });
        }
      } catch {
        if (!ignore) {
          setShellConfig(EMPTY_SHELL_CONFIG);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [loadShellConfig]);

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
        feedbackUrl={normalizedFeedbackUrl}
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
