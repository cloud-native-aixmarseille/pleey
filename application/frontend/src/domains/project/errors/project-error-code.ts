import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum ProjectErrorCode {
  CREATE_FAILED = 'project.errors.createFailed',
  DELETE_FAILED = 'project.errors.deleteFailed',
  LOAD_FAILED = 'project.errors.loadFailed',
  UPDATE_FAILED = 'project.errors.updateFailed',
}

export const PROJECT_ERROR_DEFINITIONS: Readonly<
  Record<ProjectErrorCode, DomainErrorDefinition<ProjectErrorCode>>
> = {
  [ProjectErrorCode.CREATE_FAILED]: {
    code: ProjectErrorCode.CREATE_FAILED,
    message: 'project.errors.createFailed',
    messageKey: 'project.errors.createFailed',
  },
  [ProjectErrorCode.DELETE_FAILED]: {
    code: ProjectErrorCode.DELETE_FAILED,
    message: 'project.errors.deleteFailed',
    messageKey: 'project.errors.deleteFailed',
  },
  [ProjectErrorCode.LOAD_FAILED]: {
    code: ProjectErrorCode.LOAD_FAILED,
    message: 'project.errors.loadFailed',
    messageKey: 'project.errors.loadFailed',
  },
  [ProjectErrorCode.UPDATE_FAILED]: {
    code: ProjectErrorCode.UPDATE_FAILED,
    message: 'project.errors.updateFailed',
    messageKey: 'project.errors.updateFailed',
  },
};

export { ProjectCreateFailedError } from './project-create-failed-error';
export { ProjectUpdateFailedError } from './project-update-failed-error';
