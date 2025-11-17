import { IGameRepository } from '../../domains/game/ports/game.repository.interface';
import { IGameSocket } from '../../domains/game/ports/game-socket.interface';
import { GameSession, User } from '../../shared/types';

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
    private readonly gameRepository: IGameRepository,
    private readonly gameSocket: IGameSocket
  ) { }

  async execute(request: LaunchQuizRequest): Promise<LaunchQuizResponse> {
    const { token, quizId, user, questionCount } = request;

    // Business rule: validate question count
    if (questionCount === 0) {
      throw new Error('Cannot launch quiz without questions');
    }

    // Create game session
    const session = await this.gameRepository.createSession(token, quizId);

    // Join game as host
    this.gameSocket.joinGame(session.pin, user.username, user.id);

    return { session };
  }
}
