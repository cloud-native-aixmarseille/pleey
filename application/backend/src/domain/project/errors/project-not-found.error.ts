import { ProjectErrorCode } from '../enums/project-error-code.enum';
import { ProjectError } from './project.error';

export class ProjectNotFoundError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.PROJECT_NOT_FOUND, context);
  }
}
