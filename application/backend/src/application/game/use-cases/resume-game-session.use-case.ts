import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session.entity';
import {
  GameSessionRepositoryProvider,
  type GameSessionRepository,
} from '../../../domain/game/repositories/game-session.repository.interface';

/**
 * Resume Game Session Use Case
 * Handles resuming a paused game session
 */
@Injectable()
export class ResumeGameSessionUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) { }

  async execute(sessionId: number, adminId: number): Promise<GameSession> {
    // Find the session
    const session = await this.gameSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    // Verify the admin owns this session
    if (session.adminId !== adminId) {
      throw new ForbiddenException('You do not have permission to resume this game session');
    }

    // Resume the session
    session.resume();

    // Update in database
    return await this.gameSessionRepository.updateStatus(session.id, session.status);
  }
}
