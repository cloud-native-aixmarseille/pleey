import { Injectable } from '@nestjs/common';
import { GameType } from '../../../../../domain/game/types/shared/entities/game-type';
import { StringIdentifierParser } from '../../../../shared/services/identifier-parser';
import type { IdentifierParseResult } from '../../../../shared/services/identifier-parser/contracts';

@Injectable()
export class GameTypeParser extends StringIdentifierParser<GameType> {
  constructor() {
    super('GameType');
  }

  override parse<TValue>(value: TValue): IdentifierParseResult<TValue, GameType> {
    const candidate = this.parseOrNull(value);

    if (candidate !== null) {
      return candidate as IdentifierParseResult<TValue, GameType>;
    }

    if (this.isEmpty(value)) {
      return null as IdentifierParseResult<TValue, GameType>;
    }

    this.invalidValue();
  }

  override parseOrNull(value: unknown): GameType | null {
    const candidate = super.parseOrNull(value);

    if (candidate === null) {
      return null;
    }

    return Object.values(GameType).includes(candidate as GameType) ? (candidate as GameType) : null;
  }

  protected override normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
