import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session.entity';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';

/**
 * Stop Game Session Use Case
 * Handles pausing/stopping an active game session
 */
@Injectable()
export class StopGameSessionUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(sessionId: number, adminId: number): Promise<GameSession> {
    // Find the session
    const session = await this.gameSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    // Verify the admin owns this session
    if (session.adminId !== adminId) {
      throw new ForbiddenException('You do not have permission to stop this game session');
    }

    // Pause the session - ensures only active sessions can be stopped temporarily
    session.pause();

    // Update in database
    return await this.gameSessionRepository.updateStatus(session.id, session.status);
  }
}
