import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class PasswordTooShortError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.PASSWORD_TOO_SHORT, context);
  }
}
