import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class PartyNotFoundError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.PARTY_NOT_FOUND, context);
  }
}
