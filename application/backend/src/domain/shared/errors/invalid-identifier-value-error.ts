import { DomainError } from './domain-error';
import {
  IDENTIFIER_PARSER_ERROR_DEFINITIONS,
  IdentifierParserErrorCode,
} from './identifier-parser-error-code';

export class InvalidIdentifierValueError extends DomainError<IdentifierParserErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(IDENTIFIER_PARSER_ERROR_DEFINITIONS[IdentifierParserErrorCode.INVALID_VALUE], context);
  }
}
