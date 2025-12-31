import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  type ScoreRepository,
  ScoreRepositoryProvider,
} from '../../../domain/game/repositories/score.repository.interface';

/**
 * Get Leaderboard Use Case
 * Retrieves the leaderboard for a game session
 */
@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    @Inject(ScoreRepositoryProvider)
    private readonly scoreRepository: ScoreRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(pin: string): Promise<
    Array<{
      userId: number;
      username: string;
      totalScore: number;
    }>
  > {
    // Find game session
    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    // Get leaderboard
    return this.scoreRepository.getLeaderboard(session.id);
  }
}
