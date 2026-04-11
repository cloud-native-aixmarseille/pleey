import { injectable } from 'inversify';
import { GameType } from '../../../../../domains/game/types/shared/game-type';

@injectable()
export class GameTypeParser {
  parse<TValue>(value: TValue): TValue extends null | undefined | '' ? null : GameType {
    const normalizedValue = this.parseGameTypeOrNull(value);

    if (normalizedValue !== null) {
      return normalizedValue as TValue extends null | undefined | '' ? null : GameType;
    }

    throw new Error('INVALID_GAME_TYPE');
  }

  parseOrNull(value: unknown): GameType | null {
    return this.parseGameTypeOrNull(value);
  }

  private parseGameTypeOrNull(value: unknown): GameType | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === GameType.Quiz) {
      return GameType.Quiz;
    }

    if (normalizedValue === GameType.Prediction) {
      return GameType.Prediction;
    }

    return null;
  }
}
