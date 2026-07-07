import { PresentationContextError } from './presentation-context-error';
import { PresentationContextErrorCode } from './presentation-context-error-code';

export class PresentationRoutingProviderRequiredError extends PresentationContextError {
  constructor(context?: Record<string, unknown>) {
    super(PresentationContextErrorCode.PRESENTATION_ROUTING_PROVIDER_REQUIRED, context);
  }
}
