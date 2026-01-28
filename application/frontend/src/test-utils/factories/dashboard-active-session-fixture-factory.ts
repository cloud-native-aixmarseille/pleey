import type { DashboardActiveSessionItem } from '../../domains/game-session/entities/active-game-session';
import { GameSessionParticipantRole } from '../../domains/game-session/entities/active-game-session';
import { GameSessionStatus } from '../../domains/game-session/entities/game-session-status';

let sequence = 0;

export function createDashboardActiveSessionFixture(
  overrides: Partial<DashboardActiveSessionItem> = {},
): DashboardActiveSessionItem {
  const n = ++sequence;

  return {
    sessionId: n,
    gameId: 10 + n,
    pin: 'AB12CD',
    status: GameSessionStatus.ACTIVE,
    currentStageId: n + 3,
    participantRole: GameSessionParticipantRole.HOST,
    createdAt: '2026-03-20T10:00:00.000Z',
    ...overrides,
  };
}

export function resetDashboardActiveSessionSequence(): void {
  sequence = 0;
}
