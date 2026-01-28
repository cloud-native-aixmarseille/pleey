import { inject, injectable } from 'inversify';
import type { GameSessionRepository } from '../../../../domains/game-session/ports/game-session-repository';
import { GAME_SERVICE_ID } from '../../live/shared/contracts/game-session-service-id';

@injectable()
export class LeaveCurrentPlayerSessionUseCase {
  constructor(
    @inject(GAME_SERVICE_ID.gameSessionRepository)
    private readonly gameSessionRepository: GameSessionRepository,
  ) {}

  execute(): Promise<boolean> {
    return this.gameSessionRepository.leaveCurrentPlayerSession();
  }
}
