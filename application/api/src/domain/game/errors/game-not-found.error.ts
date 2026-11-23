import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class GameNotFoundError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.GAME_NOT_FOUND, context);
  }
}
