import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum OrganizationErrorCode {
  CREATE_FAILED = 'organization.errors.createFailed',
  MEMBER_ADD_FAILED = 'organization.errors.memberAddFailed',
  MEMBER_REMOVE_FAILED = 'organization.errors.memberRemoveFailed',
  MEMBER_ROLE_UPDATE_FAILED = 'organization.errors.memberRoleUpdateFailed',
  LOAD_FAILED = 'organization.errors.loadFailed',
}

export const ORGANIZATION_ERROR_DEFINITIONS: Readonly<
  Record<OrganizationErrorCode, DomainErrorDefinition<OrganizationErrorCode>>
> = {
  [OrganizationErrorCode.CREATE_FAILED]: {
    code: OrganizationErrorCode.CREATE_FAILED,
    message: 'organization.errors.createFailed',
    messageKey: 'organization.errors.createFailed',
  },
  [OrganizationErrorCode.MEMBER_ADD_FAILED]: {
    code: OrganizationErrorCode.MEMBER_ADD_FAILED,
    message: 'organization.errors.memberAddFailed',
    messageKey: 'organization.errors.memberAddFailed',
  },
  [OrganizationErrorCode.MEMBER_REMOVE_FAILED]: {
    code: OrganizationErrorCode.MEMBER_REMOVE_FAILED,
    message: 'organization.errors.memberRemoveFailed',
    messageKey: 'organization.errors.memberRemoveFailed',
  },
  [OrganizationErrorCode.MEMBER_ROLE_UPDATE_FAILED]: {
    code: OrganizationErrorCode.MEMBER_ROLE_UPDATE_FAILED,
    message: 'organization.errors.memberRoleUpdateFailed',
    messageKey: 'organization.errors.memberRoleUpdateFailed',
  },
  [OrganizationErrorCode.LOAD_FAILED]: {
    code: OrganizationErrorCode.LOAD_FAILED,
    message: 'organization.errors.loadFailed',
    messageKey: 'organization.errors.loadFailed',
  },
};
