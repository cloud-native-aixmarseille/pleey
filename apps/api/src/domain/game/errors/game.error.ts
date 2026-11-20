import { DomainError } from '../../shared/errors/domain-error';
import { GAME_ERROR_DEFINITIONS, GameErrorCode } from '../enums/game-error-code.enum';

export abstract class GameError extends DomainError<GameErrorCode> {
  protected constructor(code: GameErrorCode, context?: Record<string, unknown>) {
    super(GAME_ERROR_DEFINITIONS[code], context);
  }
}
