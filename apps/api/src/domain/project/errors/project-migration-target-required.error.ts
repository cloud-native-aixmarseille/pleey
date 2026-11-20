import { ProjectErrorCode } from '../enums/project-error-code.enum';
import { ProjectError } from './project.error';

export class ProjectMigrationTargetRequiredError extends ProjectError {
  constructor(context?: Record<string, unknown>) {
    super(ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED, context);
  }
}
