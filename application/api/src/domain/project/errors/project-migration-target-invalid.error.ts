import { ProjectErrorCode } from '../enums/project-error-code.enum';
import { ProjectError } from './project.error';

export class ProjectMigrationTargetInvalidError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID, context);
  }
}
