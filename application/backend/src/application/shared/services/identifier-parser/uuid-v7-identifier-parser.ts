import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import type { IdentifierParseResult, IdentifierParserPort } from './contracts';
import { StringIdentifierParser } from './string-identifier-parser';

export abstract class UuidV7IdentifierParser<TIdentifier>
  extends StringIdentifierParser<TIdentifier>
  implements IdentifierParserPort<TIdentifier>
{
  protected constructor(label: string) {
    super(label);
  }

  override parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier> {
    const candidate = this.parseOrNull(value);

    if (candidate !== null) {
      return candidate as IdentifierParseResult<TValue, TIdentifier>;
    }

    if (this.isEmpty(value)) {
      return null as IdentifierParseResult<TValue, TIdentifier>;
    }

    this.invalidValue();
  }

  override parseOrNull(value: unknown): TIdentifier | null {
    const candidate = super.parseOrNull(value);

    if (candidate === null) {
      return null;
    }

    const rawCandidate = candidate as string;

    return uuidValidate(rawCandidate) && uuidVersion(rawCandidate) === 7 ? candidate : null;
  }
}
