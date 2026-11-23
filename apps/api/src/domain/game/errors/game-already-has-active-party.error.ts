import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class GameAlreadyHasActivePartyError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY, context);
  }
}
