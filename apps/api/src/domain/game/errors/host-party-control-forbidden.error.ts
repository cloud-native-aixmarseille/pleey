import { GameErrorCode } from '../enums/game-error-code.enum';
import { GameError } from './game.error';

export class HostPartyControlForbiddenError extends GameError {
  constructor(context?: Record<string, unknown>) {
    super(GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN, context);
  }
}
