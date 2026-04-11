import { IdentifierParserErrorCode } from '../../errors/identifier-parser-error-code';
import type { EmptyIdentifierValue, IdentifierParseResult } from './contracts';

export abstract class IdentifierParser<TPrimitive extends string | number, TIdentifier> {
  abstract parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier>;
  abstract parseOrNull(value: unknown): TIdentifier | null;

  protected isEmpty(value: unknown): value is EmptyIdentifierValue {
    return (
      value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
    );
  }

  protected cast(value: TPrimitive): TIdentifier {
    return value as unknown as TIdentifier;
  }

  protected invalidValue(): never {
    throw new Error(IdentifierParserErrorCode.INVALID_VALUE);
  }
}
