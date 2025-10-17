import { Injectable, NotFoundException } from '@nestjs/common';
import { IScoreRepository } from '../../../domain/game/repositories/score.repository.interface';
import { IGameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';

/**
 * Get Leaderboard Use Case
 * Retrieves the leaderboard for a game session
 */
@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    private readonly scoreRepository: IScoreRepository,
    private readonly gameSessionRepository: IGameSessionRepository,
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
