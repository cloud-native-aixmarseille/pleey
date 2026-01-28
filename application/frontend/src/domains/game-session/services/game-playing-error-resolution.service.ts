import { injectable } from 'inversify';
import { GamePlayingErrorCode, isGamePlayingErrorCode } from '../errors/game-playing-error-code';

@injectable()
export class GamePlayingErrorResolutionService {
  resolve(error: unknown): GamePlayingErrorCode {
    const value = this.extractValue(error);

    if (value) {
      const normalizedValue = this.normalizeValue(value);

      if (isGamePlayingErrorCode(normalizedValue)) {
        return normalizedValue;
      }
    }

    return GamePlayingErrorCode.UNKNOWN;
  }

  private extractValue(error: unknown): string | null {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return null;
  }

  private normalizeValue(value: string): string {
    if (value === 'GAME_SESSION_NOT_FOUND') {
      return GamePlayingErrorCode.GAME_NOT_FOUND;
    }

    return value;
  }
}
