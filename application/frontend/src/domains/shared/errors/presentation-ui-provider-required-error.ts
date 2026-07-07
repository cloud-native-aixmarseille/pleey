import { PresentationContextError } from './presentation-context-error';
import { PresentationContextErrorCode } from './presentation-context-error-code';

export class PresentationUiProviderRequiredError extends PresentationContextError {
  constructor(context?: Record<string, unknown>) {
    super(PresentationContextErrorCode.PRESENTATION_UI_PROVIDER_REQUIRED, context);
  }
}
