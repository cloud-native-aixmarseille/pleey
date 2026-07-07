import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class PartyCommandNotAvailableError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE, context);
  }
}
