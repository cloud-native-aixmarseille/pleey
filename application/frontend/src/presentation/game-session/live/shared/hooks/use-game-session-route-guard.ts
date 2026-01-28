import { useMemo } from 'react';
import {
  GameRouteKind,
  type GameSessionRouteGuardService,
  type GameSessionRouteResolvers,
} from '../../../../../domains/game-session/services/game-session-route-guard.service';
import { useAuth } from '../../../../identity/contexts/auth-context';
import { useGameJoin } from '../contexts/game-join-context';
import { useGameLobby } from '../contexts/game-lobby-context';
import { useGamePlaying } from '../contexts/game-playing-context';

export { GameRouteKind };

export function useGameSessionRouteGuard(
  routeKind: GameRouteKind,
  sessionPin: string,
  routeResolvers: GameSessionRouteResolvers,
  routeGuardService: Pick<GameSessionRouteGuardService, 'resolveRedirect'>,
): { redirectTo: string | null } {
  const { hasRestoredSession, isAuthenticated } = useAuth();
  const { joinGameFlow: flowService, guestNickname } = useGameJoin();
  const { hasGameStarted, errorCode: lobbyErrorCode } = useGameLobby();
  const {
    actionResult,
    currentStage,
    hasGameEnded,
    errorCode: playingErrorCode,
    isResultTransitionActive,
  } = useGamePlaying();

  const hasIdentity = flowService.hasPlayerIdentity(isAuthenticated, guestNickname);

  return useMemo(() => {
    return {
      redirectTo: routeGuardService.resolveRedirect(
        {
          routeKind,
          sessionPin,
          hasRestoredSession,
          isAuthenticated,
          hasIdentity,
          hasGameStarted,
          lobbyErrorCode,
          currentStage,
          actionResult,
          hasGameEnded,
          playingErrorCode,
          isResultTransitionActive,
        },
        routeResolvers,
      ),
    };
  }, [
    actionResult,
    currentStage,
    hasGameEnded,
    hasGameStarted,
    hasIdentity,
    isAuthenticated,
    isResultTransitionActive,
    hasRestoredSession,
    lobbyErrorCode,
    playingErrorCode,
    routeKind,
    routeGuardService,
    routeResolvers,
    sessionPin,
  ]);
}
