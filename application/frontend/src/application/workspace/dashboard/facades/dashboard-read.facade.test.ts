import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import {
  type DashboardActiveSessionItem,
  GameSessionParticipantRole,
} from '../../../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../../../domains/game-session/entities/game-session-status';
import { DashboardReadFacade } from './dashboard-read.facade';

function createSession(
  overrides: Partial<DashboardActiveSessionItem> = {},
): DashboardActiveSessionItem {
  return {
    sessionId: 8,
    gameId: 2,
    pin: 'AB12CD',
    status: GameSessionStatus.ACTIVE,
    currentStageId: 4,
    participantRole: GameSessionParticipantRole.HOST,
    createdAt: '2026-04-09T10:00:00.000Z',
    ...overrides,
  };
}

describe('DashboardReadFacade', () => {
  describe('loadActiveSessions()', () => {
    it('delegates active session loading to the use case', async () => {
      const listActiveGameSessionsUseCase = {
        execute: vi.fn().mockResolvedValue([createSession()]),
      };
      const getCurrentPlayerSessionUseCase = {
        execute: vi.fn().mockResolvedValue(null),
      };
      const facade = new DashboardReadFacade(
        { execute: vi.fn() } as never,
        listActiveGameSessionsUseCase as never,
        getCurrentPlayerSessionUseCase as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { resumeGameSession: vi.fn(), stopGameSession: vi.fn() } as never,
        { listGames: vi.fn() } as never,
      );

      await facade.loadActiveSessions();

      expect(listActiveGameSessionsUseCase.execute).toHaveBeenCalled();
      expect(getCurrentPlayerSessionUseCase.execute).toHaveBeenCalled();
    });

    it('keeps the host session first when the player session targets the same live session', async () => {
      const hostSession = createSession({ participantRole: GameSessionParticipantRole.HOST });
      const playerSession = createSession({ participantRole: GameSessionParticipantRole.PLAYER });
      const listActiveGameSessionsUseCase = {
        execute: vi.fn().mockResolvedValue([hostSession]),
      };
      const getCurrentPlayerSessionUseCase = {
        execute: vi.fn().mockResolvedValue(playerSession),
      };
      const facade = new DashboardReadFacade(
        { execute: vi.fn() } as never,
        listActiveGameSessionsUseCase as never,
        getCurrentPlayerSessionUseCase as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { resumeGameSession: vi.fn(), stopGameSession: vi.fn() } as never,
        { listGames: vi.fn() } as never,
      );

      await expect(facade.loadActiveSessions()).resolves.toEqual([hostSession]);
    });
  });

  describe('loadOrganizations()', () => {
    it('delegates organization loading to the use case', async () => {
      const listMyOrganizationsUseCase = {
        execute: vi.fn().mockResolvedValue([{ id: 3, name: 'Org' }]),
      };
      const facade = new DashboardReadFacade(
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        listMyOrganizationsUseCase as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { execute: vi.fn() } as never,
        { resumeGameSession: vi.fn(), stopGameSession: vi.fn() } as never,
        { listGames: vi.fn() } as never,
      );

      await facade.loadOrganizations();

      expect(listMyOrganizationsUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
