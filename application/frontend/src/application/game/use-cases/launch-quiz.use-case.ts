import { GameRepository } from "../../../domains/game/ports/game.repository";
import { GameSocket } from "../../../domains/game/ports/game-socket";
import type { GameSession } from "../../../domains/game/types";
import type { User } from "../../../domains/auth/types";

export interface LaunchQuizRequest {
  token: string;
  quizId: number;
  user: User;
  questionCount: number;
}

export interface LaunchQuizResponse {
  session: GameSession;
}

/**
 * Launch Quiz Use Case
 * Handles launching a quiz game session
 * Following Clean Architecture and Single Responsibility Principle
 */
export class LaunchQuizUseCase {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly gameSocket: GameSocket,
  ) { }

  async execute(request: LaunchQuizRequest): Promise<LaunchQuizResponse> {
    const { token, quizId, user, questionCount } = request;

    // Business rule: validate question count
    if (questionCount === 0) {
      throw new Error("Cannot launch quiz without questions");
    }

    // Create game session
    const session = await this.gameRepository.createSession(token, quizId);

    // Join game as host
    this.gameSocket.publish({
      type: "join-game",
      pin: session.pin,
      username: user.username,
      userId: user.id,
    });

    return { session };
  }
}

