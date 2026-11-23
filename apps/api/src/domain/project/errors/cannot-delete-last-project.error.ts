import { ProjectErrorCode } from '../enums/project-error-code.enum';
import { ProjectError } from './project.error';

export class CannotDeleteLastProjectError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT, context);
  }
}
