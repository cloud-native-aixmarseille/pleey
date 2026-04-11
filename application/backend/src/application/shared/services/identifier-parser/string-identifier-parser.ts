import type { IdentifierParseResult, IdentifierParserPort } from './contracts';
import { IdentifierParser } from './identifier-parser';

export abstract class StringIdentifierParser<TIdentifier>
  extends IdentifierParser<string, TIdentifier>
  implements IdentifierParserPort<TIdentifier>
{
  protected constructor(_label: string) {
    super();
  }

  parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier> {
    const candidate = this.parseStringCandidate(value, (rawValue) => this.normalize(rawValue));

    if (candidate !== null) {
      return this.cast(candidate) as IdentifierParseResult<TValue, TIdentifier>;
    }

    if (this.isEmpty(value)) {
      return null as IdentifierParseResult<TValue, TIdentifier>;
    }

    this.invalidValue();
  }

  parseOrNull(value: unknown): TIdentifier | null {
    const candidate = this.parseStringCandidate(value, (rawValue) => this.normalize(rawValue));

    return candidate === null ? null : this.cast(candidate);
  }

  protected normalize(value: string): string {
    return value.trim();
  }

  private parseStringCandidate(
    value: unknown,
    normalize: (value: string) => string = (candidate) => candidate.trim(),
  ): string | null {
    if (this.isEmpty(value) || typeof value !== 'string') {
      return null;
    }

    const normalized = normalize(value);

    if (normalized.length === 0) {
      return null;
    }

    return normalized;
  }
}
