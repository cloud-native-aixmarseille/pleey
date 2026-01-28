import { describe, expect, it } from 'vitest';
import { GameRouteKind, GameSessionRouteGuardService } from './game-session-route-guard.service';

describe('GameSessionRouteGuardService', () => {
  const service = new GameSessionRouteGuardService();
  const routeResolvers = {
    resolveJoinRoute: () => '/game/join',
    resolveLobbyRoute: (pin: string) => `/game/${pin}/lobby`,
    resolveStageRouteForStage: (pin: string, stage: { id: number }) =>
      `/game/${pin}/stage/${stage.id}`,
    resolveStageResultRouteForStage: (pin: string, stage: { id: number }) =>
      `/game/${pin}/stage/${stage.id}/result`,
    resolveLeaderboardRoute: (pin: string) => `/game/${pin}/leaderboard`,
  };

  it('redirects the stage route to the result route when a result is available', () => {
    expect(
      service.resolveRedirect(
        {
          routeKind: GameRouteKind.STAGE,
          sessionPin: 'ab12cd',
          hasRestoredSession: true,
          isAuthenticated: false,
          hasIdentity: true,
          hasGameStarted: true,
          lobbyErrorCode: null,
          currentStage: { id: 42 },
          actionResult: { isCorrect: true },
          hasGameEnded: false,
          playingErrorCode: null,
          isResultTransitionActive: false,
        },
        routeResolvers,
      ),
    ).toBe('/game/AB12CD/stage/42/result');
  });

  it('redirects the result route back to the live stage route when no result is available', () => {
    expect(
      service.resolveRedirect(
        {
          routeKind: GameRouteKind.RESULT,
          sessionPin: 'ab12cd',
          hasRestoredSession: true,
          isAuthenticated: true,
          hasIdentity: true,
          hasGameStarted: true,
          lobbyErrorCode: null,
          currentStage: { id: 42 },
          actionResult: null,
          hasGameEnded: false,
          playingErrorCode: null,
          isResultTransitionActive: false,
        },
        routeResolvers,
      ),
    ).toBe('/game/AB12CD/stage/42');
  });

  it('redirects authenticated users to the leaderboard when the session ends', () => {
    expect(
      service.resolveRedirect(
        {
          routeKind: GameRouteKind.STAGE,
          sessionPin: 'ab12cd',
          hasRestoredSession: true,
          isAuthenticated: true,
          hasIdentity: true,
          hasGameStarted: true,
          lobbyErrorCode: null,
          currentStage: { id: 42 },
          actionResult: null,
          hasGameEnded: true,
          playingErrorCode: null,
          isResultTransitionActive: false,
        },
        routeResolvers,
      ),
    ).toBe('/game/AB12CD/leaderboard');
  });
});
