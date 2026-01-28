import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { JoinGameScreenFacade } from '../../../../../application/game-session/live/player/facades/join-game-screen.facade';
import { GameSessionRouteGuardService } from '../../../../../domains/game-session/services/game-session-route-guard.service';
import { GameSessionRoutingService } from '../../../../../domains/game-session/services/game-session-routing-service';
import { GameStageScreenRoutingService } from '../../../../../domains/game-session/services/game-stage-screen-routing.service';
import { GameRoutesFactory } from './game-routes-factory';

function createGameRoutesFactory() {
  return new GameRoutesFactory(
    new JoinGameScreenFacade(),
    {} as never,
    new GameSessionRouteGuardService(),
    new GameSessionRoutingService(),
    new GameStageScreenRoutingService(),
  );
}

describe('GameRoutesFactory', () => {
  describe('create()', () => {
    it('returns the join route and a guarded session layout route', () => {
      const routes = createGameRoutesFactory().create();

      expect(routes).toHaveLength(2);
      expect(routes[0].path).toBe('game/join');
      expect(routes[1].path).toBe('game/:sessionPin');
    });

    it('nests lobby, stage, stage result and leaderboard under the session layout', () => {
      const routes = createGameRoutesFactory().create();
      const sessionRoute = routes.find((r) => r.path === 'game/:sessionPin');
      const childPaths = sessionRoute?.children?.map((c) => c.path) ?? [];

      expect(childPaths).toEqual([
        'lobby',
        'stage/:stageId',
        'stage/:stageId/result',
        'leaderboard',
      ]);
    });
  });
});
