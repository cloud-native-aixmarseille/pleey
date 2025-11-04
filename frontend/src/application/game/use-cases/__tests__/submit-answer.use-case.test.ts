import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubmitAnswerUseCase } from '../submit-answer.use-case';
import { IGameSocket } from '../../../domains/game/ports/game-socket.interface';

describe('SubmitAnswerUseCase', () => {
  let submitAnswerUseCase: SubmitAnswerUseCase;
  let mockGameSocket: IGameSocket;

  beforeEach(() => {
    mockGameSocket = {
      joinGame: vi.fn(),
      startGame: vi.fn(),
      submitAnswer: vi.fn(),
      nextQuestion: vi.fn(),
    };

    submitAnswerUseCase = new SubmitAnswerUseCase(mockGameSocket);
  });

  it('should submit answer successfully', () => {
    submitAnswerUseCase.execute({
      pin: '123456',
      userId: 1,
      answer: 'A',
      timeLeft: 15,
    });

    expect(mockGameSocket.submitAnswer).toHaveBeenCalledWith('123456', 1, 'A', 15);
  });

  it('should throw error when answer is empty', () => {
    expect(() =>
      submitAnswerUseCase.execute({
        pin: '123456',
        userId: 1,
        answer: '',
        timeLeft: 15,
      })
    ).toThrow('Answer is required');

    expect(mockGameSocket.submitAnswer).not.toHaveBeenCalled();
  });

  it('should throw error when answer is whitespace', () => {
    expect(() =>
      submitAnswerUseCase.execute({
        pin: '123456',
        userId: 1,
        answer: '   ',
        timeLeft: 15,
      })
    ).toThrow('Answer is required');

    expect(mockGameSocket.submitAnswer).not.toHaveBeenCalled();
  });
});
