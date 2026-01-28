import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../identity/contexts/auth-context';
import { useGameSessionRoutes } from '../routing/game-session-route-context';
import { Outlet } from '../routing/router';
import { uiThemeTokens } from '../ui/foundation/ui-theme';
import { AppShellHeader } from './app-shell-header';

export {
  GlobalEmptyState,
  GlobalErrorState,
  PageIntro,
  StickyActionBar,
} from './app-shell-primitives';

const shellMainStyle = {
  background: uiThemeTokens.color.surface.canvas,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
} as const;

const shellContentStyle = {
  display: 'flex',
  flex: 1,
  minHeight: 0,
} as const;

const mainContentStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  gap: uiThemeTokens.spacing.xl,
  margin: '0 auto',
  maxWidth: '104rem',
  minHeight: 0,
  padding: `${uiThemeTokens.spacing.xl} ${uiThemeTokens.spacing.md}`,
  width: '100%',
} as const;

/* ── Shell layout ── */

export function AppShellLayout() {
  const { isAuthenticated } = useAuth();
  const { resolveJoinRoute } = useGameSessionRoutes();
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
  const gameJoinRoute = resolveJoinRoute();

  return (
    <div style={shellMainStyle}>
      <AppShellHeader
        gameJoinRoute={gameJoinRoute}
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
