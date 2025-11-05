import { IGameSocket } from '../ports/game-socket.interface';
import { socket } from '../../../shared/socket/socket.client';

/**
 * Socket.IO implementation of Game Socket
 * Handles real-time game communication
 * Following Adapter Pattern and Single Responsibility Principle
 */
export class GameSocketAdapter implements IGameSocket {
  joinGame(pin: string, username: string, userId?: number, guestId?: string): void {
    socket.emit('join-game', { pin, username, userId, guestId });
  }

  startGame(pin: string): void {
    socket.emit('start-game', { pin });
  }

  submitAnswer(pin: string, userId: number | undefined, answer: string, timeLeft: number, guestId?: string): void {
    socket.emit('submit-answer', { pin, userId, answer, timeLeft, guestId });
  }

  nextQuestion(pin: string): void {
    socket.emit('next-question', { pin });
  }
}
