import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import {
  createAnswerRevealSchedulerMock,
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createSessionStateRepositoryMock,
} from '../../../test-utils/mock-factories';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { ResumeGameWsUseCase } from './resume-game-ws.use-case';

describe('ResumeGameWsUseCase', () => {
  it('throws when session is not found', async () => {
    const state = {};
    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: null });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new ResumeGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await expect(useCase.execute('123456', 1)).rejects.toBeInstanceOf(WsException);
    try {
      await useCase.execute('123456', 1);
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.GAME_NOT_FOUND);
    }
  });

  it('updates status, optionally schedules, and broadcasts state', async () => {
    const state = {
      resume: vi.fn().mockReturnValue(5),
      currentQuestion: {
        questionText: 'Q',
        correctAnswer: 'A',
        timeLimit: 10,
        points: 1000,
        type: 'multiple',
      },
      currentQuestionIndex: 0,
      totalQuestions: 10,
    };
    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 1 } as never,
      updateStatus: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new ResumeGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await useCase.execute('123456', 1);

    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, 'active');
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 5);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'game-resumed',
        pin: '123456',
        questionNumber: 1,
        totalQuestions: 10,
        timeLeft: 5,
      }),
    );
  });
});
