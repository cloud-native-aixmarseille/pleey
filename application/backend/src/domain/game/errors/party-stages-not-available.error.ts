import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class PartyStagesNotAvailableError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE, context);
  }
}
