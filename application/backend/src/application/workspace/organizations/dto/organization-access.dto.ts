import type { Organization } from '../../../../domain/organization/entities/organization';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import type { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type {
  OrganizationMemberPermissions,
  OrganizationPermissions,
} from '../../../../domain/organization/value-objects/organization-permissions';

export type OrganizationWithAccess = Organization & {
  readonly role: OrganizationRole;
  readonly permissions: OrganizationPermissions;
  readonly assignableRoles: readonly OrganizationRole[];
};

export type OrganizationMemberWithAccess = OrganizationMember & {
  readonly permissions: OrganizationMemberPermissions;
  readonly assignableRoles: readonly OrganizationRole[];
};
