import { DomainError } from '../../shared/errors/domain-error';
import { IDENTITY_ERROR_DEFINITIONS, IdentityErrorCode } from '../enums/identity-error-code.enum';

export abstract class IdentityError extends DomainError<IdentityErrorCode> {
  protected constructor(code: IdentityErrorCode, context?: Record<string, unknown>) {
    super(IDENTITY_ERROR_DEFINITIONS[code], context);
  }
}
