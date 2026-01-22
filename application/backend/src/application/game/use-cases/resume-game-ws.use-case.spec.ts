import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { createGameSessionStateFixture } from '../../../test-utils/fixtures/unit';
import {
  createAnswerRevealSchedulerMock,
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createGameSessionStateServiceMock,
} from '../../../test-utils/mock-factories';
import { GameBroadcastEventType } from '../ports';
import { ResumeGameWsUseCase } from './resume-game-ws.use-case';

describe('ResumeGameWsUseCase', () => {
  it('throws when session is not found', async () => {
    const state = createGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: null });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new ResumeGameWsUseCase(
      gameSessionStateService as never,
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
    const state = createGameSessionStateFixture({
      resume: vi.fn().mockReturnValue(5),
      currentQuestion: {
        id: 1,
        position: 0,
        questionText: 'Q',
        answers: [{ id: 1, text: 'A', position: 0, isCorrect: true }],
        timeLimit: 10,
        points: 1000,
        type: QuestionType.MULTIPLE,
      },
      totalQuestions: 10,
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 1 } as never,
      updateStatus: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new ResumeGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await useCase.execute('123456', 1);

    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ACTIVE);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 5);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.GAME_RESUMED,
        pin: '123456',
        totalQuestions: 10,
        timeLeft: 5,
      }),
    );
  });
});
