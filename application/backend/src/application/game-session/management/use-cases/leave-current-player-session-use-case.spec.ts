import { describe, expect, it, vi } from 'vitest';
import { GameBroadcastEventType } from '../../../../domain/game/ports/services/game-broadcast.service';
import { createGameBroadcastServiceMock } from '../../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { LeaveCurrentPlayerSessionUseCase } from './leave-current-player-session-use-case';

describe('LeaveCurrentPlayerSessionUseCase', () => {
  it('returns false when no active player session is stored', async () => {
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinByUserId: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const useCase = new LeaveCurrentPlayerSessionUseCase(
      gameSessionStateService as never,
      broadcastService as never,
    );

    await expect(useCase.execute(7)).resolves.toBe(false);
  });

  it('removes the active player mapping and updates the lobby roster when connected', async () => {
    const state = {
      sessionId: 12,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
      removePlayerByUserId: vi.fn().mockReturnValue(true),
      getNonHostPlayers: vi.fn().mockReturnValue([]),
      playerCount: 1,
      hasStages: true,
    };
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinByUserId: 'AB12CD',
      get: state as never,
      update: undefined,
      removePinByUserId: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const useCase = new LeaveCurrentPlayerSessionUseCase(
      gameSessionStateService as never,
      broadcastService as never,
    );

    await expect(useCase.execute(7)).resolves.toBe(true);
    expect(gameSessionStateService.removePinByUserId).toHaveBeenCalledWith(7);
    expect(gameSessionStateService.update).toHaveBeenCalledWith('AB12CD', state);
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: 'AB12CD',
      sessionId: 12,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
      players: [],
    });
  });
});
