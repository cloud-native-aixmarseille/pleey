import { Inject, Injectable } from '@nestjs/common';
import type { GameSession } from '../../game/entities/game-session';
import type {
  GameResumeSessionHandler,
  GameResumeSessionHandlerInput,
} from '../../game/ports/handlers/game-resume-session-handler.registry';
import type { GameSessionRepository } from '../../game/ports/repositories/game-session.repository';
import { GameSessionRepositoryProvider } from '../../game/ports/repositories/game-session.repository';

@Injectable()
export class QuizGameResumeSessionHandler implements GameResumeSessionHandler {
  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  async resumeSession({ session }: GameResumeSessionHandlerInput): Promise<GameSession> {
    session.resume();
    return this.gameSessionRepository.updateStatus(session.id, session.status);
  }
}
