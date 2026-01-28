import { describe, expect, it } from 'vitest';
import { GameStageScreenRoutingService } from './game-stage-screen-routing.service';

describe('GameStageScreenRoutingService', () => {
  const service = new GameStageScreenRoutingService();
  const routeResolvers = {
    resolveLobbyRoute: (pin: string) => `/game/${pin}/lobby`,
    resolveStageRoute: (pin: string, stageId: number) => `/game/${pin}/stage/${stageId}`,
  };

  it('redirects to the current stage when the requested stage id is stale', () => {
    expect(
      service.resolveRedirect(
        {
          sessionPin: 'ab12cd',
          hasRestoredSession: true,
          requestedStageId: 1,
          currentStage: { id: 2 },
          hasGameEnded: false,
          hasStageWaitTimedOut: false,
        },
        routeResolvers,
      ),
    ).toBe('/game/AB12CD/stage/2');
  });

  it('redirects back to the lobby when stage sync times out', () => {
    expect(
      service.resolveRedirect(
        {
          sessionPin: 'ab12cd',
          hasRestoredSession: true,
          requestedStageId: 1,
          currentStage: null,
          hasGameEnded: false,
          hasStageWaitTimedOut: true,
        },
        routeResolvers,
      ),
    ).toBe('/game/AB12CD/lobby');
  });

  it('does not redirect after the game has already ended', () => {
    expect(
      service.resolveRedirect(
        {
          sessionPin: 'ab12cd',
          hasRestoredSession: true,
          requestedStageId: 1,
          currentStage: null,
          hasGameEnded: true,
          hasStageWaitTimedOut: true,
        },
        routeResolvers,
      ),
    ).toBeNull();
  });
});
