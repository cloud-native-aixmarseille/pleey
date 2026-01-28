import { useEffect } from 'react';
import type { GameSessionRouteGuardService } from '../../../../../domains/game-session/services/game-session-route-guard.service';
import { useGameSessionRoutes } from '../../../../shared/routing/game-session-route-context';
import {
  Outlet,
  PresentationRedirect,
  usePresentationParams,
} from '../../../../shared/routing/router';
import { useGameLobby } from '../contexts/game-lobby-context';
import { useGamePlaying } from '../contexts/game-playing-context';
import { GameRouteKind, useGameSessionRouteGuard } from '../hooks/use-game-session-route-guard';

interface GameSessionGuardLayoutProps {
  readonly routeGuardService: Pick<GameSessionRouteGuardService, 'resolveRedirect'>;
}

function resolveRouteKind(pathname: string): GameRouteKind {
  if (pathname.includes('/leaderboard')) return GameRouteKind.LEADERBOARD;
  if (pathname.includes('/result')) return GameRouteKind.RESULT;
  if (pathname.includes('/stage/')) return GameRouteKind.STAGE;
  return GameRouteKind.LOBBY;
}

export function GameSessionGuardLayout({ routeGuardService }: GameSessionGuardLayoutProps) {
  const { sessionPin } = usePresentationParams<'sessionPin'>();
  const normalizedPin = (sessionPin ?? '').trim().toUpperCase();
  const routeResolvers = useGameSessionRoutes();

  const { activateSession: activateLobby } = useGameLobby();
  const { activateSession: activatePlaying } = useGamePlaying();

  useEffect(() => {
    if (normalizedPin) {
      activateLobby(normalizedPin);
      activatePlaying(normalizedPin);
    }
  }, [normalizedPin]);

  const routeKind = resolveRouteKind(globalThis.location.pathname);
  const { redirectTo } = useGameSessionRouteGuard(
    routeKind,
    sessionPin ?? '',
    routeResolvers,
    routeGuardService,
  );

  if (redirectTo) {
    return <PresentationRedirect replace to={redirectTo} />;
  }

  return <Outlet />;
}
