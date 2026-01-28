import { describe, expect, it, vi } from 'vitest';
import { GameBroadcastEventType } from '../../../../../domain/game/ports/services/game-broadcast.service';
import { createGameBroadcastServiceMock } from '../../../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { RemoveDisconnectedPlayerUseCase } from './remove-disconnected-player-use-case';

describe('RemoveDisconnectedPlayerUseCase', () => {
  it('no-ops when socket is not associated with a session', async () => {
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinBySocketId: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new RemoveDisconnectedPlayerUseCase(
      gameSessionStateService as never,
      broadcastService as never,
    );

    await useCase.execute('socket-1');
    expect(broadcastService.publish).not.toHaveBeenCalled();
  });

  it('broadcasts player list when a player is removed', async () => {
    const state = {
      sessionId: 1,
      removePlayerBySocketId: vi.fn().mockReturnValue(true),
      getNonHostPlayers: () => [],
      playerCount: 1,
      hasStages: true,
    };

    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinBySocketId: '123456',
      get: state as never,
      update: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new RemoveDisconnectedPlayerUseCase(
      gameSessionStateService as never,
      broadcastService as never,
    );

    await useCase.execute('socket-1');
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      players: [],
    });
  });
});
