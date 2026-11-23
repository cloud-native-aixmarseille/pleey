import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class GameValidationFailedError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.VALIDATION_FAILED, context);
  }
}
