import { Injectable } from '@nestjs/common';
import { ThemeErrorCode } from '../../../domain/theme/errors/theme-error';
import { AbstractErrorCodeHttpStatusService } from '../../shared/error-handling/abstract-error-code-http-status.service';
@Injectable()
export class ThemeErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<ThemeErrorCode> {
  constructor() {
    super(Object.values(ThemeErrorCode), {
      [ThemeErrorCode.INVALID_DOCUMENT]: 400,
      [ThemeErrorCode.INVALID_SELECTION]: 400,
      [ThemeErrorCode.INVALID_ASSET]: 400,
      [ThemeErrorCode.NOT_FOUND]: 404,
      [ThemeErrorCode.REVISION_CONFLICT]: 409,
    });
  }
}
