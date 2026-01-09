import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import {
  createAnswerRevealSchedulerMock,
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createSessionStateRepositoryMock,
} from '../../../test-utils/mock-factories';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { StartGameWsUseCase } from './start-game-ws.use-case';

describe('StartGameWsUseCase', () => {
  it('throws when game session is not found', async () => {
    const state = { hasQuestions: true };
    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: null });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new StartGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await expect(useCase.execute('123456')).rejects.toBeInstanceOf(WsException);
    try {
      await useCase.execute('123456');
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.GAME_NOT_FOUND);
    }
  });

  it('starts the game, schedules reveal, updates status and broadcasts', async () => {
    type SessionStateStub = {
      hasQuestions: boolean;
      sessionId: number;
      totalQuestions: number;
      currentQuestion: {
        questionText: string;
        correctAnswer: string;
        timeLimit: number;
        points: number;
        type: string;
      };
      startQuestion: () => void;
    };

    const state: SessionStateStub = {
      hasQuestions: true,
      sessionId: 1,
      totalQuestions: 2,
      currentQuestion: {
        questionText: 'Q',
        correctAnswer: 'A',
        timeLimit: 10,
        points: 1000,
        type: 'multiple',
      },
      startQuestion: vi.fn(),
    };
    const sessionStateRepository = createSessionStateRepositoryMock({ getOrCreate: state });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1 } as never,
      updateStatus: undefined,
      updateCurrentQuestion: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new StartGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await useCase.execute('123456');

    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, 'active');
    expect(gameSessionRepository.updateCurrentQuestion).toHaveBeenCalledWith(1, 0);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 10);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'game-started',
        pin: '123456',
        questionNumber: 1,
        totalQuestions: 2,
      }),
    );
  });
});
