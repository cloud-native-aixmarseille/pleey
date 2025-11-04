import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JoinGameUseCase } from '../join-game.use-case';
import { IGameSocket } from '../../../domains/game/ports/game-socket.interface';

describe('JoinGameUseCase', () => {
  let joinGameUseCase: JoinGameUseCase;
  let mockGameSocket: IGameSocket;

  beforeEach(() => {
    mockGameSocket = {
      joinGame: vi.fn(),
      startGame: vi.fn(),
      submitAnswer: vi.fn(),
      nextQuestion: vi.fn(),
    };

    joinGameUseCase = new JoinGameUseCase(mockGameSocket);
  });

  it('should join game successfully', () => {
    joinGameUseCase.execute({
      pin: '123456',
      username: 'player1',
      userId: 1,
    });

    expect(mockGameSocket.joinGame).toHaveBeenCalledWith('123456', 'player1', 1);
  });

  it('should throw error when PIN is empty', () => {
    expect(() =>
      joinGameUseCase.execute({
        pin: '',
        username: 'player1',
        userId: 1,
      })
    ).toThrow('Game PIN is required');

    expect(mockGameSocket.joinGame).not.toHaveBeenCalled();
  });

  it('should throw error when PIN is whitespace', () => {
    expect(() =>
      joinGameUseCase.execute({
        pin: '   ',
        username: 'player1',
        userId: 1,
      })
    ).toThrow('Game PIN is required');

    expect(mockGameSocket.joinGame).not.toHaveBeenCalled();
  });
});
