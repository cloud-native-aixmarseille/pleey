import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationError } from './organization.error';

export class MemberAlreadyExistsError extends OrganizationError {
  constructor(context?: Record<string, unknown>) {
    super(OrganizationErrorCode.MEMBER_ALREADY_EXISTS, context);
  }
}
