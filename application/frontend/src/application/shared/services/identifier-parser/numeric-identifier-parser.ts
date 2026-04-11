import type { IdentifierParseResult, IdentifierParserPort } from './contracts';
import { IdentifierParser } from './identifier-parser';

export abstract class NumericIdentifierParser<TIdentifier>
  extends IdentifierParser<number, TIdentifier>
  implements IdentifierParserPort<TIdentifier>
{
  protected constructor(_label: string) {
    super();
  }

  parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier> {
    const candidate = this.parseNumericCandidate(value);

    if (candidate !== null) {
      return this.cast(candidate) as IdentifierParseResult<TValue, TIdentifier>;
    }

    if (this.isEmpty(value)) {
      return null as IdentifierParseResult<TValue, TIdentifier>;
    }

    this.invalidValue();
  }

  parseOrNull(value: unknown): TIdentifier | null {
    const candidate = this.parseNumericCandidate(value);

    return candidate === null ? null : this.cast(candidate);
  }

  private parseNumericCandidate(value: unknown): number | null {
    if (this.isEmpty(value)) {
      return null;
    }

    const candidate =
      typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;

    if (!Number.isInteger(candidate) || candidate <= 0) {
      return null;
    }

    return candidate;
  }
}
