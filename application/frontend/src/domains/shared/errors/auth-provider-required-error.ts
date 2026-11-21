import { PresentationContextError } from './presentation-context-error';
import { PresentationContextErrorCode } from './presentation-context-error-code';

export class AuthProviderRequiredError extends PresentationContextError {
  constructor(context?: Record<string, unknown>) {
    super(PresentationContextErrorCode.AUTH_PROVIDER_REQUIRED, context);
  }
}
