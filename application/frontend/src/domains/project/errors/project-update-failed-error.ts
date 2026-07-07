import { ProjectError } from './project-error';
import { ProjectErrorCode } from './project-error-code';

export class ProjectUpdateFailedError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.UPDATE_FAILED, context);
  }
}
