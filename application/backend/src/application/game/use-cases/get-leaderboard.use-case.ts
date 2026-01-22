import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import {
  type ScoreRepository,
  ScoreRepositoryProvider,
} from '../../../domain/game/ports/score.repository';

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

  async execute(pin: GameSessionPin): Promise<
    Array<{
      userId?: UserId;
      guestId?: GuestId;
      username: string;
      totalScore: number;
    }>
  > {
    // Find game session
    const session = await this.gameSessionRepository.findByPin(pin);
    if (!session) {
      throw new NotFoundException(GameErrorCode.GAME_NOT_FOUND);
    }

    // Get leaderboard
    return this.scoreRepository.getLeaderboard(session.id);
  }
}
