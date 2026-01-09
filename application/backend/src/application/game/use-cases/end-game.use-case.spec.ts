import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';

import { GameErrorCode } from '../enums/game-error-code.enum';
import { EndGameUseCase } from './end-game.use-case';

describe('EndGameUseCase', () => {
  it('throws UNAUTHORIZED_SESSION_CONTROL when hostId does not match', async () => {
    const state = {
      sessionId: 1,
      getScoresExcludingHost: () => [],
    };
    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      findByPin: vi.fn().mockResolvedValue({ id: 1, hostId: 999 }),
      updateStatus: vi.fn(),
    };
    const timerService = {
      clearAnswerRevealTimer: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new EndGameUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await expect(useCase.execute({ pin: '123456', hostId: 1 })).rejects.toBeInstanceOf(WsException);

    try {
      await useCase.execute({ pin: '123456', hostId: 1 });
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }
  });

  it('ends the game, clears timers, broadcasts and removes state', async () => {
    const state = {
      sessionId: 1,
      getScoresExcludingHost: () => [
        { playerId: 'user-1', username: 'alice', totalPoints: 100, isGuest: false },
      ],
    };
    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      remove: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      findByPin: vi.fn().mockResolvedValue({ id: 1, hostId: 1, status: 'active' }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };
    const timerService = {
      clearAnswerRevealTimer: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new EndGameUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute({ pin: '123456', hostId: 1 });

    expect(timerService.clearAnswerRevealTimer).toHaveBeenCalledWith('123456');
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, 'ended');
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'game-ended', pin: '123456' }),
    );
    expect(sessionStateRepository.remove).toHaveBeenCalledWith('123456');
  });
});
