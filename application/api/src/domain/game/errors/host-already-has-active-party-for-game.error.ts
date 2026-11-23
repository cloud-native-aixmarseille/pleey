import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class HostAlreadyHasActivePartyForGameError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME, context);
  }
}
