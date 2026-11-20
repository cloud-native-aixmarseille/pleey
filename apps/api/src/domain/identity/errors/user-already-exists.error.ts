import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class UserAlreadyExistsError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.USER_ALREADY_EXISTS, context);
  }
}
