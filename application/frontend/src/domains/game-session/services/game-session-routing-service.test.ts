import { describe, expect, it } from 'vitest';
import { GameSessionStatus } from '../entities/game-session-status';
import { GameSessionRoutingService } from './game-session-routing-service';

describe('GameSessionRoutingService', () => {
  const service = new GameSessionRoutingService();

  describe('resolveJoinRoute()', () => {
    it('returns the join route', () => {
      expect(service.resolveJoinRoute()).toBe('/game/join');
    });

    it('includes the encoded pin query when provided', () => {
      expect(service.resolveJoinRoute('AB 12')).toBe('/game/join?pin=AB%2012');
    });
  });

  describe('resolveLobbyRoute()', () => {
    it('routes to the lobby and normalizes the pin', () => {
      expect(service.resolveLobbyRoute(' ab12cd ')).toBe('/game/AB12CD/lobby');
    });
  });

  describe('resolveStageRoute()', () => {
    it('routes to the provided stage and normalizes the pin', () => {
      expect(service.resolveStageRoute(' ab12cd ', 42)).toBe('/game/AB12CD/stage/42');
    });
  });

  describe('resolveStageResultRoute()', () => {
    it('routes to the provided stage result and normalizes the pin', () => {
      expect(service.resolveStageResultRoute(' ab12cd ', 42)).toBe('/game/AB12CD/stage/42/result');
    });
  });

  describe('resolveStageRouteForStage()', () => {
    it('routes from a stage entity id', () => {
      expect(service.resolveStageRouteForStage('ab12cd', { id: 42 })).toBe('/game/AB12CD/stage/42');
    });
  });

  describe('resolveStageResultRouteForStage()', () => {
    it('routes from a stage entity id to the result route', () => {
      expect(service.resolveStageResultRouteForStage('ab12cd', { id: 42 })).toBe(
        '/game/AB12CD/stage/42/result',
      );
    });
  });

  describe('resolveLeaderboardRoute()', () => {
    it('routes to the leaderboard and normalizes the pin', () => {
      expect(service.resolveLeaderboardRoute(' ab12cd ')).toBe('/game/AB12CD/leaderboard');
    });
  });

  describe('resolveEntryRoute()', () => {
    it('routes to the lobby for a waiting session', () => {
      const route = service.resolveEntryRoute({
        pin: 'ab12cd',
        status: GameSessionStatus.WAITING,
      });

      expect(route).toBe('/game/AB12CD/lobby');
    });

    it('routes to the current stage id for an active session', () => {
      const route = service.resolveEntryRoute({
        pin: 'ab12cd',
        status: GameSessionStatus.ACTIVE,
        currentStageId: 17,
      });

      expect(route).toBe('/game/AB12CD/stage/17');
    });

    it('routes to the lobby for a paused session', () => {
      const route = service.resolveEntryRoute({
        pin: 'ab12cd',
        status: GameSessionStatus.PAUSED,
        currentStageId: 23,
      });

      expect(route).toBe('/game/AB12CD/lobby');
    });

    it('falls back to the lobby when an active session has no current stage id', () => {
      const route = service.resolveEntryRoute({ pin: 'ab12cd', status: GameSessionStatus.ACTIVE });

      expect(route).toBe('/game/AB12CD/lobby');
    });

    it('routes to the leaderboard for an ended session', () => {
      const route = service.resolveEntryRoute({ pin: 'ab12cd', status: GameSessionStatus.ENDED });

      expect(route).toBe('/game/AB12CD/leaderboard');
    });

    it('defaults to the lobby for an unknown status', () => {
      const route = service.resolveEntryRoute({ pin: 'ab12cd', status: 'unknown' });

      expect(route).toBe('/game/AB12CD/lobby');
    });

    it('normalizes the pin to uppercase and trims whitespace', () => {
      const route = service.resolveEntryRoute({
        pin: '  xY34zW  ',
        status: GameSessionStatus.WAITING,
      });

      expect(route).toBe('/game/XY34ZW/lobby');
    });
  });
});
