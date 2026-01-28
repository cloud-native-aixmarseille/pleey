import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameSession, GameSessionId } from '../../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import {
  type GameResumeSessionHandlerRegistry,
  GameResumeSessionHandlerRegistryProvider,
} from '../../../../domain/game/ports/handlers/game-resume-session-handler.registry';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../../domain/game/ports/repositories/game.repository';
import type { GameSessionRepository } from '../../../../domain/game/ports/repositories/game-session.repository';
import { GameSessionRepositoryProvider } from '../../../../domain/game/ports/repositories/game-session.repository';

@Injectable()
export class ResumeHostSessionUseCase {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(GameResumeSessionHandlerRegistryProvider)
    private readonly resumeSessionHandlerRegistry: GameResumeSessionHandlerRegistry,
  ) {}

  async execute(sessionId: GameSessionId, hostId: UserId): Promise<GameSession> {
    const session = await this.gameSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error(GameErrorCode.GAME_SESSION_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new Error(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    const game = await this.gameRepository.findById(session.gameId);
    if (!game) {
      throw new Error(GameErrorCode.GAME_NOT_FOUND);
    }

    const handler = this.resumeSessionHandlerRegistry.resolve(game.type);
    return await handler.resumeSession({ session, sessionId, hostId });
  }
}
