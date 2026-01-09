import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { GameSession } from '../../../domain/game/entities/game-session';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import { GameErrorCode } from '../enums/game-error-code.enum';

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

  async execute(sessionId: number, hostId: number): Promise<GameSession> {
    // Find the session
    const session = await this.gameSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(GameErrorCode.GAME_NOT_FOUND);
    }

    // Verify the host owns this session
    if (session.hostId !== hostId) {
      throw new ForbiddenException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    // Pause the session - ensures only active sessions can be stopped temporarily
    session.pause();

    // Update in database
    return await this.gameSessionRepository.updateStatus(session.id, session.status);
  }
}
