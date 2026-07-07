import { AuthError } from './auth-error';
import { AuthErrorCode } from './auth-error-code';

export class InvalidResponseError extends AuthError {
  constructor(context?: Record<string, unknown>) {
    super(AuthErrorCode.INVALID_RESPONSE, context);
  }
}
