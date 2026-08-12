import { InvalidIdentifierValueError } from '../../../../domains/shared/errors/identifier-parser-error-code';
import type { EmptyIdentifierValue, IdentifierParseResult } from './contracts';

export abstract class IdentifierParser<TPrimitive extends string | number, TIdentifier> {
  protected constructor(private readonly label: string) {}

  abstract parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier>;
  abstract parseOrNull(value: unknown): TIdentifier | null;

  protected isEmpty(value: unknown): value is EmptyIdentifierValue {
    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
  }

  protected cast(value: TPrimitive): TIdentifier {
    return value as unknown as TIdentifier;
  }

  protected invalidValue(value: unknown): never {
    throw new InvalidIdentifierValueError({
      parserLabel: this.label,
      receivedValueLength: typeof value === 'string' ? value.length : undefined,
      receivedValueType: Array.isArray(value) ? 'array' : typeof value,
    });
  }
}
