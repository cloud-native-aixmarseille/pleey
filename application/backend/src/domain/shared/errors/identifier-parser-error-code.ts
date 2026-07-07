import type { DomainErrorDefinition } from './domain-error';

export enum IdentifierParserErrorCode {
  INVALID_VALUE = 'shared.errors.identifier.invalidValue',
}

export const IDENTIFIER_PARSER_ERROR_DEFINITIONS: Readonly<
  Record<IdentifierParserErrorCode, DomainErrorDefinition<IdentifierParserErrorCode>>
> = {
  [IdentifierParserErrorCode.INVALID_VALUE]: {
    code: IdentifierParserErrorCode.INVALID_VALUE,
    messageKey: 'shared.errors.identifier.invalidValue',
  },
};

export { InvalidIdentifierValueError } from './invalid-identifier-value-error';
