import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class InvalidRefreshTokenError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.INVALID_REFRESH_TOKEN, context);
  }
}
