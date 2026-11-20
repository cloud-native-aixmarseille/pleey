import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class RefreshTokenExpiredError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.REFRESH_TOKEN_EXPIRED, context);
  }
}
