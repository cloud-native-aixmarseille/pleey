import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationError } from './organization.error';

export class CannotRemoveLastOwnerError extends OrganizationError {
  constructor(context?: Record<string, unknown>) {
    super(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER, context);
  }
}
