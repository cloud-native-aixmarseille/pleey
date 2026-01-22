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
import { StartGameWsUseCase } from './start-game-ws.use-case';

describe('StartGameWsUseCase', () => {
  it('throws when game session is not found', async () => {
    const state = createGameSessionStateFixture({ hasQuestions: true });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: null });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new StartGameWsUseCase(
      gameSessionStateService as never,
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
    const state = createGameSessionStateFixture({
      hasQuestions: true,
      sessionId: 1,
      totalQuestions: 2,
      currentQuestion: {
        id: 42,
        position: 0,
        questionText: 'Q',
        answers: [{ id: 1, text: 'A', position: 0, isCorrect: true }],
        timeLimit: 10,
        points: 1000,
        type: QuestionType.MULTIPLE,
      },
      startQuestion: vi.fn(),
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1 } as never,
      updateStatus: undefined,
      updateCurrentQuestion: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new StartGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await useCase.execute('123456');

    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ACTIVE);
    expect(gameSessionRepository.updateCurrentQuestion).toHaveBeenCalledWith(1, 42);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 10);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.GAME_STARTED,
        pin: '123456',
        totalQuestions: 2,
      }),
    );
  });
});
