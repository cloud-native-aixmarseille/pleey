import { GameSocket } from "../../../domains/game/ports/game-socket";

export interface SubmitAnswerRequest {
  pin: string;
  userId: number;
  answerId: number;
  timeLeft: number;
}

/**
 * Submit Answer Use Case
 * Handles player submitting an answer
 * Following Clean Architecture and Single Responsibility Principle
 */
export class SubmitAnswerUseCase {
  constructor(private readonly gameSocket: GameSocket) { }

  execute(request: SubmitAnswerRequest): void {
    const { pin, userId, answerId, timeLeft } = request;

    // Business rule: validate answer
    if (!Number.isFinite(answerId)) {
      throw new Error("Answer is required");
    }

    this.gameSocket.publish({
      type: "submit-answer",
      pin,
      userId,
      answerId,
      timeLeft,
    });
  }
}
