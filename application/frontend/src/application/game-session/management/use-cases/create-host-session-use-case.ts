import { inject, injectable } from 'inversify';
import type { DashboardActiveSessionItem } from '../../../../domains/game-session/entities/active-game-session';
import type { GameSessionRepository } from '../../../../domains/game-session/ports/game-session-repository';
import { GAME_SERVICE_ID } from '../../live/shared/contracts/game-session-service-id';

interface CreateHostSessionCommand {
  readonly gameId: number;
}

@injectable()
export class CreateHostSessionUseCase {
  constructor(
    @inject(GAME_SERVICE_ID.gameSessionRepository)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  execute(command: CreateHostSessionCommand): Promise<DashboardActiveSessionItem> {
    return this.gameSessionRepository.createGameSession(command.gameId);
  }
}
