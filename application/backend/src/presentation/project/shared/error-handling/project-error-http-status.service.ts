import { Injectable } from '@nestjs/common';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import { AbstractErrorCodeHttpStatusService } from '../../../shared/error-handling/abstract-error-code-http-status.service';

const PROJECT_ERROR_CODES = Object.values(ProjectErrorCode) as ProjectErrorCode[];

const PROJECT_ERROR_HTTP_STATUSES: Record<ProjectErrorCode, number> = {
  [ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT]: 400,
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID]: 400,
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND]: 404,
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED]: 400,
  [ProjectErrorCode.PROJECT_NOT_FOUND]: 404,
};

@Injectable()
export class ProjectErrorHttpStatusService extends AbstractErrorCodeHttpStatusService<ProjectErrorCode> {
  constructor() {
    super(PROJECT_ERROR_CODES, PROJECT_ERROR_HTTP_STATUSES);
  }
}
