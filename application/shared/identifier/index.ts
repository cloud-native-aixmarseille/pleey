export type EmptyIdentifierValue = "" | null | undefined;

export type IdentifierParseResult<TValue, TIdentifier> = TValue extends EmptyIdentifierValue
  ? null
  : Extract<TValue, EmptyIdentifierValue> extends never
    ? TIdentifier
    : TIdentifier | null;

export interface IdentifierParserPort<TIdentifier> {
  parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier>;
  parseOrNull(value: unknown): TIdentifier | null;
}

export interface InvalidIdentifierContext {
  readonly parserLabel: string;
  readonly receivedValueLength?: number;
  readonly receivedValueType: string;
}

export interface InvalidIdentifierHandler {
  invalid(context: InvalidIdentifierContext): never;
}

export abstract class IdentifierParser<TPrimitive extends string | number, TIdentifier> {
  private readonly label: string;
  private readonly invalid: InvalidIdentifierHandler;

  protected constructor(label: string, invalid: InvalidIdentifierHandler) {
    this.label = label;
    this.invalid = invalid;
  }

  abstract parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier>;
  abstract parseOrNull(value: unknown): TIdentifier | null;

  protected isEmpty(value: unknown): value is EmptyIdentifierValue {
    return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
  }

  protected cast(value: TPrimitive): TIdentifier {
    return value as unknown as TIdentifier;
  }

  protected invalidValue(value: unknown): never {
    this.invalid.invalid({
      parserLabel: this.label,
      receivedValueLength: typeof value === "string" ? value.length : undefined,
      receivedValueType: Array.isArray(value) ? "array" : typeof value,
    });
  }
}

export abstract class StringIdentifierParser<TIdentifier>
  extends IdentifierParser<string, TIdentifier>
  implements IdentifierParserPort<TIdentifier>
{
  protected constructor(label: string, invalid: InvalidIdentifierHandler) {
    super(label, invalid);
  }

  parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier> {
    const candidate = this.parseStringCandidate(value, (rawValue) => this.normalize(rawValue));

    if (candidate !== null) {
      return this.cast(candidate) as IdentifierParseResult<TValue, TIdentifier>;
    }

    if (this.isEmpty(value)) {
      return null as IdentifierParseResult<TValue, TIdentifier>;
    }

    this.invalidValue(value);
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
    if (this.isEmpty(value) || typeof value !== "string") return null;
    const normalized = normalize(value);
    return normalized.length === 0 ? null : normalized;
  }
}

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export abstract class UuidV7IdentifierParser<TIdentifier>
  extends StringIdentifierParser<TIdentifier>
  implements IdentifierParserPort<TIdentifier>
{
  protected constructor(label: string, invalid: InvalidIdentifierHandler) {
    super(label, invalid);
  }

  override parse<TValue>(value: TValue): IdentifierParseResult<TValue, TIdentifier> {
    const candidate = this.parseOrNull(value);
    if (candidate !== null) return candidate as IdentifierParseResult<TValue, TIdentifier>;
    if (this.isEmpty(value)) return null as IdentifierParseResult<TValue, TIdentifier>;
    this.invalidValue(value);
  }

  override parseOrNull(value: unknown): TIdentifier | null {
    const candidate = super.parseOrNull(value);
    if (candidate === null) return null;
    return UUID_V7_PATTERN.test(candidate as string) ? candidate : null;
  }
}
