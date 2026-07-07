import { PresentationContextError } from './presentation-context-error';
import { PresentationContextErrorCode } from './presentation-context-error-code';

export class PresentationToastProviderRequiredError extends PresentationContextError {
  constructor(context?: Record<string, unknown>) {
    super(PresentationContextErrorCode.PRESENTATION_TOAST_PROVIDER_REQUIRED, context);
  }
}
