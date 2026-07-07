import { ProjectError } from './project-error';
import { ProjectErrorCode } from './project-error-code';

export class ProjectCreateFailedError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.CREATE_FAILED, context);
  }
}
