import { SetMetadata } from '@nestjs/common';
import type { OrganizationRole } from '../../domain/organization/enums/organization-role.enum';

export const ORGANIZATION_ROLES_KEY = 'organizationRoles';

export interface OrganizationRolesMetadata {
  roles: OrganizationRole[];
  organizationIdParam?: string;
  memberIdParam?: string;
}

export const OrganizationRoles = (
  roles: OrganizationRole[],
  options: Omit<OrganizationRolesMetadata, 'roles'> = {},
) =>
  SetMetadata(ORGANIZATION_ROLES_KEY, {
    roles,
    organizationIdParam: options.organizationIdParam,
    memberIdParam: options.memberIdParam,
  } satisfies OrganizationRolesMetadata);
