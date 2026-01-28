import { injectable } from 'inversify';
import { GameLobbyErrorCode, isGameLobbyErrorCode } from '../errors/game-lobby-error-code';

@injectable()
export class GameLobbyErrorResolutionService {
  resolve(error: unknown): GameLobbyErrorCode {
    const value = this.extractValue(error);

    if (value) {
      const normalizedValue = this.normalizeValue(value);

      if (isGameLobbyErrorCode(normalizedValue)) {
        return normalizedValue;
      }
    }

    return GameLobbyErrorCode.UNKNOWN;
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
      return GameLobbyErrorCode.GAME_NOT_FOUND;
    }

    return value;
  }
}
