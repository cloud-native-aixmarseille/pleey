import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationError } from './organization.error';

export class OrganizationNameAlreadyExistsError extends OrganizationError {
  constructor(context?: Record<string, unknown>) {
    super(OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS, context);
  }
}
