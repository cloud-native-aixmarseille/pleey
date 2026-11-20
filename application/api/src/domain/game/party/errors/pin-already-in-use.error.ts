import { DomainError } from '../../../shared/errors/domain-error';
import { GAME_ERROR_DEFINITIONS, GameErrorCode } from '../../enums/game-error-code.enum';

export class PinAlreadyInUseError extends DomainError<GameErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(GAME_ERROR_DEFINITIONS[GameErrorCode.PIN_ALREADY_IN_USE], context);
  }
}
