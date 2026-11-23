import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class CaptchaUnavailableError extends IdentityError {
  constructor(context: Record<string, unknown>) {
    super(IdentityErrorCode.CAPTCHA_UNAVAILABLE, context);
  }
}
