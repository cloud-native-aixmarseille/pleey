import { APP_BOOTSTRAP_ERROR_DEFINITIONS, AppBootstrapErrorCode } from './app-bootstrap-error-code';
import { DomainError } from './domain-error';

export class RootElementNotFoundError extends DomainError<AppBootstrapErrorCode> {
  constructor(context?: Record<string, unknown>) {
    super(APP_BOOTSTRAP_ERROR_DEFINITIONS[AppBootstrapErrorCode.ROOT_ELEMENT_NOT_FOUND], context);
  }
}
