import { AuthError } from './auth-error';
import { AuthErrorCode } from './auth-error-code';

export class GenericAuthError extends AuthError {
  constructor(context?: Record<string, unknown>) {
    super(AuthErrorCode.GENERIC, context);
  }
}
