import { DomainError } from '../../shared/errors/domain-error';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from './auth-error-code';

export abstract class AuthError extends DomainError<AuthErrorCode> {
  protected constructor(code: AuthErrorCode, context?: Record<string, unknown>) {
    super(AUTH_ERROR_DEFINITIONS[code], context);
  }
}
