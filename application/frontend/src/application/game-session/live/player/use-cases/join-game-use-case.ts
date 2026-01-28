import { inject, injectable } from 'inversify';
import { GameJoinErrorCode } from '../../../../../domains/game-session/errors/game-join-error-code';
import { JoinGameFlowService } from '../../../../../domains/game-session/services/join-game-flow-service';
import type {
  GameSessionJoinRuntimePort,
  JoinGameDispatchCommand,
  JoinGameDispatchReceipt,
} from '../../shared/contracts/game-session-join-runtime.contract';
import { GAME_SERVICE_ID } from '../../shared/contracts/game-session-service-id';

interface JoinGameCommand {
  readonly pin: string;
  readonly username: string;
  readonly userId?: number;
  readonly guestId?: string;
}

@injectable()
export class JoinGameUseCase {
  constructor(
    @inject(GAME_SERVICE_ID.gameJoinRuntime)
    private readonly gameJoinRuntime: GameSessionJoinRuntimePort,
    @inject(JoinGameFlowService)
    private readonly joinGameFlowService: JoinGameFlowService,
  ) {}

  buildRequest(command: JoinGameCommand): JoinGameDispatchCommand {
    const pin = this.joinGameFlowService.normalizePin(command.pin);
    const username = this.joinGameFlowService.sanitizeDisplayName(command.username);

    if (pin.length === 0) {
      throw new Error(GameJoinErrorCode.PIN_REQUIRED);
    }

    if (!this.joinGameFlowService.isPinComplete(pin)) {
      throw new Error(GameJoinErrorCode.PIN_INVALID);
    }

    if (!this.joinGameFlowService.hasDisplayName(username)) {
      throw new Error(GameJoinErrorCode.DISPLAY_NAME_REQUIRED);
    }

    const request = {
      pin,
      username,
      userId: command.userId,
      guestId: command.guestId,
    } satisfies JoinGameDispatchCommand;

    return request;
  }

  execute(command: JoinGameCommand): JoinGameDispatchCommand {
    const request = this.buildRequest(command);

    this.gameJoinRuntime.joinGame(request);

    return request;
  }

  async executeWithReceipt(command: JoinGameCommand): Promise<{
    readonly receipt: JoinGameDispatchReceipt;
    readonly request: JoinGameDispatchCommand;
  }> {
    const request = this.buildRequest(command);
    const receipt = await this.gameJoinRuntime.joinGameWithReceipt(request);

    return { receipt, request };
  }
}
