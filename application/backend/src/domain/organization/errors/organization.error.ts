import { DomainError } from '../../shared/errors/domain-error';
import { ORGANIZATION_ERROR_DEFINITIONS, OrganizationErrorCode } from '../enums/organization-error-code.enum';

export abstract class OrganizationError extends DomainError<OrganizationErrorCode> {
  protected constructor(code: OrganizationErrorCode, context?: Record<string, unknown>) {
    super(ORGANIZATION_ERROR_DEFINITIONS[code], context);
  }
}
