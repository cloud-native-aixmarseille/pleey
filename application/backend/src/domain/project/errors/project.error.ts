import { DomainError } from '../../shared/errors/domain-error';
import { PROJECT_ERROR_DEFINITIONS, ProjectErrorCode } from '../enums/project-error-code.enum';

export abstract class ProjectError extends DomainError<ProjectErrorCode> {
  protected constructor(code: ProjectErrorCode, context?: Record<string, unknown>) {
    super(PROJECT_ERROR_DEFINITIONS[code], context);
  }
}
