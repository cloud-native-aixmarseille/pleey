import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class UserNotFoundError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.USER_NOT_FOUND, context);
  }
}
