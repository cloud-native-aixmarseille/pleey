import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class AvatarNotFoundError extends IdentityError {
  constructor(context?: Record<string, unknown>) {
    super(IdentityErrorCode.AVATAR_NOT_FOUND, context);
  }
}
