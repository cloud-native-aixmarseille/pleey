import { IGameSocket } from '../ports/game-socket.interface';
import { socket } from '../../../shared/socket/socket.client';

/**
 * Socket.IO implementation of Game Socket
 * Handles real-time game communication
 * Following Adapter Pattern and Single Responsibility Principle
 */
export class GameSocketAdapter implements IGameSocket {
  joinGame(pin: string, username: string, userId: number): void {
    socket.emit('join-game', { pin, username, userId });
  }

  startGame(pin: string): void {
    socket.emit('start-game', { pin });
  }

  submitAnswer(pin: string, userId: number, answer: string, timeLeft: number): void {
    socket.emit('submit-answer', { pin, userId, answer, timeLeft });
  }

  nextQuestion(pin: string): void {
    socket.emit('next-question', { pin });
  }
}
