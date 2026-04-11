export type EmptyIdentifierValue = '' | null | undefined;

export type IdentifierParseResult<TValue, TIdentifier> = TValue extends EmptyIdentifierValue
  ? null
  : Extract<TValue, EmptyIdentifierValue> extends never
    ? TIdentifier
    : TIdentifier | null;

export interface IdentifierParserPort<TIdentifier> {
  parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier>;
  parseOrNull(value: unknown): TIdentifier | null;
}
