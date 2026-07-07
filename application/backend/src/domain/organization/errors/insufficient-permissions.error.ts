import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationError } from './organization.error';

export class InsufficientPermissionsError extends OrganizationError {
  constructor(context?: Record<string, unknown>) {
    super(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS, context);
  }
}
