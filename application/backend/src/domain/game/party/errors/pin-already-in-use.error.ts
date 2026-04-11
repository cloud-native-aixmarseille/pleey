import { GameErrorCode } from '../../enums/game-error-code.enum';

export class PinAlreadyInUseError extends Error {
  constructor() {
    super(GameErrorCode.PIN_ALREADY_IN_USE);
  }
}
