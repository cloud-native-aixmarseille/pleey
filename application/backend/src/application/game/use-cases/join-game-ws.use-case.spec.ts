import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';

import type { JoinGameDto } from '../dto/join-game.dto';
import { JoinGameWsUseCase } from './join-game-ws.use-case';

describe('JoinGameWsUseCase', () => {
  it('throws when both userId and guestId are provided', async () => {
    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue({
        addPlayer: vi.fn(),
        getNonHostPlayers: () => [],
        sessionId: 1,
        hostId: 999,
      }),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      findByPin: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new JoinGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = {
      pin: '123456',
      username: 'alice',
      userId: 1,
      guestId: 'g1',
    };

    await expect(useCase.execute('socket-1', dto)).rejects.toBeInstanceOf(WsException);
  });

  it('broadcasts player list', async () => {
    const state = {
      sessionId: 1,
      hostId: 999,
      addPlayer: vi.fn(),
      getNonHostPlayers: () => [],
      findPlayerByGuestId: vi.fn().mockReturnValue(undefined),
      findPlayerByUserId: vi.fn().mockReturnValue(undefined),
    };

    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      findByPin: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new JoinGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = { pin: '123456', username: 'alice', guestId: 'g1' };
    await useCase.execute('socket-1', dto);

    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: 'player-joined',
      pin: '123456',
      sessionId: 1,
      players: [],
    });
    expect(state.addPlayer).toHaveBeenCalledTimes(1);
  });

  it('rebroadcasts paused state when joining a paused session', async () => {
    const state = {
      sessionId: 1,
      hostId: 999,
      hasQuestions: true,
      pausedTimeLeft: 7,
      currentQuestionIndex: 0,
      totalQuestions: 3,
      currentQuestion: { timeLimit: 20 },
      addPlayer: vi.fn(),
      getNonHostPlayers: () => [],
      findPlayerByGuestId: vi.fn().mockReturnValue(undefined),
      findPlayerByUserId: vi.fn().mockReturnValue(undefined),
    };

    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      findByPin: vi.fn().mockResolvedValue({ status: 'paused' }),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new JoinGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = { pin: '123456', username: 'alice', guestId: 'g1' };
    await useCase.execute('socket-1', dto);

    expect(broadcastService.publish).toHaveBeenNthCalledWith(1, {
      type: 'player-joined',
      pin: '123456',
      sessionId: 1,
      players: [],
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(2, {
      type: 'game-state',
      connectionId: 'socket-1',
      question: state.currentQuestion,
      questionNumber: 1,
      totalQuestions: 3,
      timeLeft: 7,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(3, {
      type: 'game-paused',
      pin: '123456',
      timeLeft: 7,
    });
  });

  it('sends game-state to host when joining a paused session, then broadcasts paused state', async () => {
    const state = {
      sessionId: 1,
      hostId: 42,
      hasQuestions: true,
      pausedTimeLeft: 11,
      questionStartTime: Date.now() - 4000,
      currentQuestionIndex: 0,
      totalQuestions: 3,
      currentQuestion: { timeLimit: 20 },
      addPlayer: vi.fn(),
      getNonHostPlayers: () => [],
      findPlayerByGuestId: vi.fn().mockReturnValue(undefined),
      findPlayerByUserId: vi.fn().mockReturnValue(undefined),
    };

    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      findByPin: vi.fn().mockResolvedValue({ status: 'paused' }),
    };
    const broadcastService = {
      publish: vi.fn(),
    };

    const useCase = new JoinGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = { pin: '123456', username: 'host', userId: 42 };
    await useCase.execute('socket-host', dto);

    expect(broadcastService.publish).toHaveBeenNthCalledWith(1, {
      type: 'player-joined',
      pin: '123456',
      sessionId: 1,
      players: [],
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(2, {
      type: 'game-state',
      connectionId: 'socket-host',
      question: state.currentQuestion,
      questionNumber: 1,
      totalQuestions: 3,
      timeLeft: 11,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(3, {
      type: 'game-paused',
      pin: '123456',
      timeLeft: 11,
    });
  });
});
