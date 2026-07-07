import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class PlayerAlreadyInActivePartyError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY, context);
  }
}
