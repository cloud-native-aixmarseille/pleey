import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSession, GameSessionId } from '../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { GameSessionRepositoryProvider } from '../../../domain/game/ports/game-session.repository';

/**
 * Handles resuming a paused game session
 */
@Injectable()
export class ResumeGameSessionUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(sessionId: GameSessionId, hostId: UserId): Promise<GameSession> {
    // Find the session
    const session = await this.gameSessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(GameErrorCode.GAME_NOT_FOUND);
    }

    // Verify the host owns this session
    if (session.hostId !== hostId) {
      throw new ForbiddenException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    // Resume the session
    session.resume();

    // Update in database
    return await this.gameSessionRepository.updateStatus(session.id, session.status);
  }
}
