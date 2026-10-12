import { OrganizationMembershipAccessService } from '../../application/workspace/organizations/services/organization-membership-access.service';
import { ProjectPermissionService } from '../../application/workspace/projects/services/project-permission-service';
import type { OrganizationRepository } from '../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../domain/organization/ports/organization-member.repository';
import { OrganizationMembershipPolicy } from '../../domain/organization/services/organization-membership-policy';
import { ProjectPermissionPolicy } from '../../domain/project/services/project-permission-policy';
import { createOrganizationRepositoryMock } from '../mock-factories/organization.mock-factory';

export function createWorkspacePermissionServices(
  memberRepository: OrganizationMemberRepository,
  organizationRepository: OrganizationRepository = createOrganizationRepositoryMock(),
) {
  const membershipAccess = new OrganizationMembershipAccessService(
    organizationRepository,
    memberRepository,
    new OrganizationMembershipPolicy(),
  );
  return {
    membershipAccess,
    projectPermissions: new ProjectPermissionService(membershipAccess, new ProjectPermissionPolicy()),
  };
}
