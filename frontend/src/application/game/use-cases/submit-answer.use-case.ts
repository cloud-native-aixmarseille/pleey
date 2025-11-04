import { IGameSocket } from '../../domains/game/ports/game-socket.interface';

export interface SubmitAnswerRequest {
  pin: string;
  userId: number;
  answer: string;
  timeLeft: number;
}

/**
 * Submit Answer Use Case
 * Handles player submitting an answer
 * Following Clean Architecture and Single Responsibility Principle
 */
export class SubmitAnswerUseCase {
  constructor(private readonly gameSocket: IGameSocket) { }

  execute(request: SubmitAnswerRequest): void {
    const { pin, userId, answer, timeLeft } = request;

    // Business rule: validate answer
    if (!answer || answer.trim().length === 0) {
      throw new Error('Answer is required');
    }

    this.gameSocket.submitAnswer(pin, userId, answer, timeLeft);
  }
}
