import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameSession, GameSessionId } from '../../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game-session.repository';

@Injectable()
export class StopHostSessionUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async execute(sessionId: GameSessionId, hostId: UserId): Promise<GameSession> {
    const session = await this.gameSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(GameErrorCode.GAME_SESSION_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new Error(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    session.pause();

    return await this.gameSessionRepository.updateStatus(session.id, session.status);
  }
}
