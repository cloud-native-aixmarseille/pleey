import { describe, expect, it, vi } from 'vitest';

import {
  createGameBroadcastServiceMock,
  createGameSessionStateServiceMock,
} from '../../../test-utils/mock-factories';
import { GameBroadcastEventType } from '../ports';
import { HandleDisconnectWsUseCase } from './handle-disconnect-ws.use-case';

describe('HandleDisconnectWsUseCase', () => {
  it('no-ops when socket is not associated with a session', async () => {
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinBySocketId: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new HandleDisconnectWsUseCase(
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
      hasQuestions: true,
    };

    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinBySocketId: '123456',
      get: state as never,
      update: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new HandleDisconnectWsUseCase(
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
