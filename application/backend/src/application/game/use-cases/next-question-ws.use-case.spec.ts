import { describe, expect, it, vi } from 'vitest';

import { NextQuestionWsUseCase } from './next-question-ws.use-case';

describe('NextQuestionWsUseCase', () => {
  it('ends the game when there are no more questions', async () => {
    const state = {
      hasMoreQuestions: false,
    };
    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      updateCurrentQuestion: vi.fn(),
    };
    const broadcastService = {
      publish: vi.fn(),
    };
    const endGameUseCase = {
      endGame: vi.fn().mockResolvedValue(undefined),
    };
    const scheduler = {
      schedule: vi.fn(),
    };

    const useCase = new NextQuestionWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
      endGameUseCase as never,
      scheduler as never,
    );

    await useCase.execute('123456');
    expect(endGameUseCase.endGame).toHaveBeenCalledWith('123456', state);
  });

  it('advances and broadcasts next question when available', async () => {
    const state = {
      hasMoreQuestions: true,
      sessionId: 1,
      currentQuestionIndex: 0,
      currentQuestion: {
        questionText: 'Q',
        correctAnswer: 'A',
        timeLimit: 10,
        points: 1000,
        type: 'multiple',
      },
      advanceToNextQuestion: vi.fn(),
    };

    vi.mocked(state.advanceToNextQuestion).mockImplementation(() => {
      state.currentQuestionIndex = 1;
    });
    const sessionStateRepository = {
      getOrCreate: vi.fn().mockResolvedValue(state),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const gameSessionRepository = {
      updateCurrentQuestion: vi.fn().mockResolvedValue(undefined),
    };
    const broadcastService = {
      publish: vi.fn(),
    };
    const endGameUseCase = {
      endGame: vi.fn(),
    };
    const scheduler = {
      schedule: vi.fn(),
    };

    const useCase = new NextQuestionWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      broadcastService as never,
      endGameUseCase as never,
      scheduler as never,
    );

    await useCase.execute('123456');
    expect(gameSessionRepository.updateCurrentQuestion).toHaveBeenCalledWith(1, 1);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 10);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'next-question', pin: '123456', questionNumber: 2 }),
    );
  });
});
