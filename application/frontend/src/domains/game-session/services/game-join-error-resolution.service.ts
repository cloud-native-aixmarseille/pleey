import { injectable } from 'inversify';
import { GameJoinErrorCode, isGameJoinErrorCode } from '../errors/game-join-error-code';

@injectable()
export class GameJoinErrorResolutionService {
  resolve(error: unknown): GameJoinErrorCode {
    if (error instanceof Error && isGameJoinErrorCode(error.message)) {
      return error.message;
    }

    return GameJoinErrorCode.UNKNOWN;
  }
}
