import { ProjectErrorCode } from '../enums/project-error-code.enum';
import { ProjectError } from './project.error';

export class ProjectMigrationTargetNotFoundError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND, context);
  }
}
