import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationError } from './organization.error';

export class MemberNotFoundError extends OrganizationError {
  constructor(context?: Record<string, unknown>) {
    super(OrganizationErrorCode.MEMBER_NOT_FOUND, context);
  }
}
