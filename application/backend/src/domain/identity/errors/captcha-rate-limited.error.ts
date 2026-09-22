import { IdentityErrorCode } from '../enums/identity-error-code.enum';
import { IdentityError } from './identity.error';

export class CaptchaRateLimitedError extends IdentityError {
  constructor(context: Record<string, unknown>) {
    super(IdentityErrorCode.CAPTCHA_RATE_LIMITED, context);
  }
}
