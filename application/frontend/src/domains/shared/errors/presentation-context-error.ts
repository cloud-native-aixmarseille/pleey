import { DomainError } from './domain-error';
import {
  PRESENTATION_CONTEXT_ERROR_DEFINITIONS,
  PresentationContextErrorCode,
} from './presentation-context-error-code';

export abstract class PresentationContextError extends DomainError<PresentationContextErrorCode> {
  protected constructor(code: PresentationContextErrorCode, context?: Record<string, unknown>) {
    super(PRESENTATION_CONTEXT_ERROR_DEFINITIONS[code], context);
  }
}
