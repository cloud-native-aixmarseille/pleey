import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum ProjectErrorCode {
  CANNOT_DELETE_LAST_PROJECT = 'CANNOT_DELETE_LAST_PROJECT',
  PROJECT_MIGRATION_TARGET_INVALID = 'PROJECT_MIGRATION_TARGET_INVALID',
  PROJECT_MIGRATION_TARGET_NOT_FOUND = 'PROJECT_MIGRATION_TARGET_NOT_FOUND',
  PROJECT_MIGRATION_TARGET_REQUIRED = 'PROJECT_MIGRATION_TARGET_REQUIRED',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
}

export const PROJECT_ERROR_DEFINITIONS: Readonly<
  Record<ProjectErrorCode, DomainErrorDefinition<ProjectErrorCode>>
> = {
  [ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT]: {
    code: ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT,
    messageKey: 'project.errors.cannotDeleteLastProject',
  },
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID]: {
    code: ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID,
    messageKey: 'project.errors.migrationTargetInvalid',
  },
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND]: {
    code: ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND,
    messageKey: 'project.errors.migrationTargetNotFound',
  },
  [ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED]: {
    code: ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED,
    messageKey: 'project.errors.migrationTargetRequired',
  },
  [ProjectErrorCode.PROJECT_NOT_FOUND]: {
    code: ProjectErrorCode.PROJECT_NOT_FOUND,
    messageKey: 'project.errors.projectNotFound',
  },
};
