import type { UserId } from '../../../../../domain/auth/entities/user';
import type { Game } from '../../../../../domain/game/entities/game';
import type { GameSession, GameSessionPin } from '../../../../../domain/game/entities/game-session';
import type { GameSessionState } from '../../../../../domain/game/entities/game-session-state';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';

interface AuthorizedHostContext {
  readonly state: GameSessionState;
  readonly session: GameSession;
}

interface AuthorizedHostGameContext extends AuthorizedHostContext {
  readonly game: Game;
}

export abstract class AbstractHostAuthorizedUseCase {
  protected constructor(
    protected readonly hostStageControlContextService: HostStageControlContextService,
  ) {}

  protected loadAuthorizedHostContext(
    pin: GameSessionPin,
    hostId: UserId,
  ): Promise<AuthorizedHostContext> {
    return this.hostStageControlContextService.load(pin, hostId);
  }

  protected async loadAuthorizedHostGameContext(
    pin: GameSessionPin,
    hostId: UserId,
  ): Promise<AuthorizedHostGameContext> {
    const context = await this.loadAuthorizedHostContext(pin, hostId);
    const game = await this.hostStageControlContextService.loadGame(context.session.gameId);

    return {
      ...context,
      game,
    };
  }
}
