import { describe, expect, it, vi } from 'vitest';
import { QuestionType } from '../../../domain/quiz/entities/question';
import { createGameSessionStateFixture } from '../../../test-utils/fixtures/unit';
import {
  createAnswerRevealSchedulerMock,
  createEndGameUseCaseMock,
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createGameSessionStateServiceMock,
} from '../../../test-utils/mock-factories';
import { GameBroadcastEventType } from '../ports';
import { NextQuestionWsUseCase } from './next-question-ws.use-case';

describe('NextQuestionWsUseCase', () => {
  it('ends the game when there are no more questions', async () => {
    const state = createGameSessionStateFixture({
      hasMoreQuestions: false,
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const endGameUseCase = createEndGameUseCaseMock({ endGame: undefined });
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new NextQuestionWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      endGameUseCase as never,
      scheduler as never,
    );

    await useCase.execute('123456');
    expect(endGameUseCase.endGame).toHaveBeenCalledWith('123456', state);
  });

  it('advances and broadcasts next question when available', async () => {
    const advanceToNextQuestion = vi.fn();
    const state = createGameSessionStateFixture({
      hasMoreQuestions: true,
      sessionId: 1,
      currentQuestionId: 55,
      currentQuestion: {
        id: 55,
        position: 1,
        questionText: 'Q',
        answers: [{ id: 1, text: 'A', position: 0, isCorrect: true }],
        timeLimit: 10,
        points: 1000,
        type: QuestionType.MULTIPLE,
      },
      advanceToNextQuestion,
    });

    vi.mocked(advanceToNextQuestion).mockImplementation(() => {
      state.currentQuestionId = 55;
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      updateCurrentQuestion: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const endGameUseCase = createEndGameUseCaseMock();
    const scheduler = createAnswerRevealSchedulerMock();

    const useCase = new NextQuestionWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      endGameUseCase as never,
      scheduler as never,
    );

    await useCase.execute('123456');
    expect(gameSessionRepository.updateCurrentQuestion).toHaveBeenCalledWith(1, 55);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 10);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.NEXT_QUESTION,
        pin: '123456',
        question: state.currentQuestion,
      }),
    );
  });
});
