import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class ActivePartyExistsError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.ACTIVE_PARTY_EXISTS, context);
  }
}
