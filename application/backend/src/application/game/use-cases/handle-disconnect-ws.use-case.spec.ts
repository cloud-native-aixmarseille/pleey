import { describe, expect, it, vi } from 'vitest';

import { HandleDisconnectWsUseCase } from './handle-disconnect-ws.use-case';

describe('HandleDisconnectWsUseCase', () => {
  it('no-ops when socket is not associated with a session', async () => {
    const sessionStateRepository = {
      findPinBySocketId: vi.fn().mockResolvedValue(null),
      get: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new HandleDisconnectWsUseCase(
      sessionStateRepository as never,
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
      currentQuestionIndex: 0,
      totalQuestions: 10,
    };

    const sessionStateRepository = {
      findPinBySocketId: vi.fn().mockResolvedValue('123456'),
      get: vi.fn().mockResolvedValue(state),
      save: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new HandleDisconnectWsUseCase(
      sessionStateRepository as never,
      broadcastService as never,
    );

    await useCase.execute('socket-1');
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: 'player-joined',
      pin: '123456',
      sessionId: 1,
      players: [],
    });
  });
});
