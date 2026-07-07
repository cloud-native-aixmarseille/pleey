import { type DomainErrorDefinition } from '../../shared/errors/domain-error';

export enum OrganizationErrorCode {
  ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND',
  ORGANIZATION_NAME_ALREADY_EXISTS = 'ORGANIZATION_NAME_ALREADY_EXISTS',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  MEMBER_ALREADY_EXISTS = 'MEMBER_ALREADY_EXISTS',
  MEMBER_USER_NOT_FOUND = 'MEMBER_USER_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CANNOT_REMOVE_LAST_OWNER = 'CANNOT_REMOVE_LAST_OWNER',
  NOT_A_MEMBER = 'NOT_A_MEMBER',
}

export const ORGANIZATION_ERROR_DEFINITIONS: Readonly<
  Record<OrganizationErrorCode, DomainErrorDefinition<OrganizationErrorCode>>
> = {
  [OrganizationErrorCode.ORGANIZATION_NOT_FOUND]: {
    code: OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    messageKey: 'organization.errors.organizationNotFound',
  },
  [OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS]: {
    code: OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS,
    messageKey: 'organization.errors.organizationNameAlreadyExists',
  },
  [OrganizationErrorCode.MEMBER_NOT_FOUND]: {
    code: OrganizationErrorCode.MEMBER_NOT_FOUND,
    messageKey: 'organization.errors.memberNotFound',
  },
  [OrganizationErrorCode.MEMBER_ALREADY_EXISTS]: {
    code: OrganizationErrorCode.MEMBER_ALREADY_EXISTS,
    messageKey: 'organization.errors.memberAlreadyExists',
  },
  [OrganizationErrorCode.MEMBER_USER_NOT_FOUND]: {
    code: OrganizationErrorCode.MEMBER_USER_NOT_FOUND,
    messageKey: 'organization.errors.memberUserNotFound',
  },
  [OrganizationErrorCode.INSUFFICIENT_PERMISSIONS]: {
    code: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    messageKey: 'organization.errors.insufficientPermissions',
  },
  [OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER]: {
    code: OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER,
    messageKey: 'organization.errors.cannotRemoveLastOwner',
  },
  [OrganizationErrorCode.NOT_A_MEMBER]: {
    code: OrganizationErrorCode.NOT_A_MEMBER,
    messageKey: 'organization.errors.notAMember',
  },
};
