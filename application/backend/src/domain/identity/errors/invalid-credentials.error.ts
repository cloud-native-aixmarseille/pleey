import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class InvalidCredentialsError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.INVALID_CREDENTIALS, context);
  }
}
