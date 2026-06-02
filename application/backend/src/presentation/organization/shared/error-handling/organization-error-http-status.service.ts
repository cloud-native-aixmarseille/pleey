import { Injectable } from '@nestjs/common';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../shared/error-handling/abstract-error-code-http-status.service';

const ORGANIZATION_ERROR_CODES = Object.values(OrganizationErrorCode) as OrganizationErrorCode[];

const ORGANIZATION_ERROR_HTTP_STATUSES: Record<OrganizationErrorCode, number> = {
  [OrganizationErrorCode.ORGANIZATION_NOT_FOUND]: 404,
  [OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS]: 409,
  [OrganizationErrorCode.MEMBER_NOT_FOUND]: 404,
  [OrganizationErrorCode.MEMBER_ALREADY_EXISTS]: 409,
  [OrganizationErrorCode.MEMBER_USER_NOT_FOUND]: 404,
  [OrganizationErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  [OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER]: 400,
  [OrganizationErrorCode.NOT_A_MEMBER]: 403,
};

@Injectable()
export class OrganizationErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<OrganizationErrorCode> {
  constructor() {
    super(ORGANIZATION_ERROR_CODES, ORGANIZATION_ERROR_HTTP_STATUSES);
  }
}
