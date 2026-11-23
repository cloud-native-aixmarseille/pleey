import { PresentationContextError } from './presentation-context-error';
import { PresentationContextErrorCode } from './presentation-context-error-code';

export class PresentationFormProviderRequiredError extends PresentationContextError {
  constructor(context?: Record<string, unknown>) {
    super(PresentationContextErrorCode.PRESENTATION_FORM_PROVIDER_REQUIRED, context);
  }
}
