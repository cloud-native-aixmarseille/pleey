import { THEME_ID_PATTERN, type ThemeId } from '../../../../domains/theme/entities/theme-id';
import { StringIdentifierParser } from '../../../shared/services/identifier-parser';
import type { IdentifierParseResult } from '../../../shared/services/identifier-parser/contracts';

export class ThemeIdentifier extends StringIdentifierParser<ThemeId> {
  constructor() {
    super('ThemeId');
  }

  override parse<TValue>(value: TValue): IdentifierParseResult<TValue, ThemeId> {
    const candidate = this.parseOrNull(value);

    if (candidate !== null) {
      return candidate as IdentifierParseResult<TValue, ThemeId>;
    }

    if (this.isEmpty(value)) {
      return null as IdentifierParseResult<TValue, ThemeId>;
    }

    this.invalidValue(value);
  }

  override parseOrNull(value: unknown): ThemeId | null {
    const candidate = super.parseOrNull(value);

    return candidate !== null && THEME_ID_PATTERN.test(candidate) ? (candidate as ThemeId) : null;
  }
}
