import { Injectable } from '@nestjs/common';
import { IdentityErrorCode } from '../../../../domain/identity/enums/identity-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../shared/error-handling/abstract-error-code-http-status.service';

const IDENTITY_ERROR_CODES = Object.values(IdentityErrorCode) as IdentityErrorCode[];

const IDENTITY_ERROR_HTTP_STATUSES: Record<IdentityErrorCode, number> = {
  [IdentityErrorCode.INVALID_CREDENTIALS]: 401,
  [IdentityErrorCode.USER_ALREADY_EXISTS]: 409,
  [IdentityErrorCode.PASSWORD_TOO_SHORT]: 400,
  [IdentityErrorCode.USER_NOT_FOUND]: 404,
  [IdentityErrorCode.UNAUTHORIZED]: 401,
  [IdentityErrorCode.AUTHENTICATION_REQUIRED]: 401,
  [IdentityErrorCode.AVATAR_NOT_FOUND]: 404,
  [IdentityErrorCode.INVALID_REFRESH_TOKEN]: 401,
  [IdentityErrorCode.REFRESH_TOKEN_EXPIRED]: 401,
};

@Injectable()
export class IdentityErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<IdentityErrorCode> {
  constructor() {
    super(IDENTITY_ERROR_CODES, IDENTITY_ERROR_HTTP_STATUSES);
  }
}
