/**
 * Descriptor for a domain error.
 * `code` is the stable machine-readable identifier used by policies and transport mappings.
 * `messageKey` is the translation lookup key resolved at the presentation boundary.
 */
export interface DomainErrorDefinition<TCode extends string = string> {
  readonly code: TCode;
  readonly messageKey: string;
}

export class DomainError<TCode extends string = string> extends Error {
  override readonly name: string;
  readonly code: TCode;
  readonly messageKey: string;
  readonly context?: Record<string, unknown>;

  constructor(definition: DomainErrorDefinition<TCode>, context?: Record<string, unknown>) {
    // Keep Error.message aligned with the code so existing `toThrow(ERROR_CODE)` assertions
    // and transport error-code resolution continue to work while human-readable text is
    // still resolved later from messageKey.
    super(definition.code);
    this.name = new.target.name;
    this.code = definition.code;
    this.messageKey = definition.messageKey;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function createDomainError<TCode extends string>(
  definition: DomainErrorDefinition<TCode>,
  context?: Record<string, unknown>,
): DomainError<TCode> {
  return new DomainError(definition, context);
}

export function isDomainError(error: unknown): error is DomainError<string> {
  return error instanceof DomainError;
}
