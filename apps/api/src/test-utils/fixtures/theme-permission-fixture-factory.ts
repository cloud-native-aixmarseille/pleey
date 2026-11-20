import { OrganizationRole } from '@pleey/contracts/organization';
import { ThemePermissionService } from '../../application/workspace/themes/services/theme-permission-service';
import { ThemePermissionPolicy } from '../../domain/theme/services/theme-permission-policy';
import { createOrganizationMemberRepositoryMock } from '../mock-factories/organization.mock-factory';
import { createOrganizationMemberFixture } from './unit/organization-member.fixture';
import { createWorkspacePermissionServices } from './workspace-permission-fixture-factory';

export class ThemePermissionFixtureFactory {
  create(role: OrganizationRole | null = OrganizationRole.MANAGER) {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: role === null ? null : createOrganizationMemberFixture({ role }),
    });
    const { membershipAccess } = createWorkspacePermissionServices(memberRepository);
    return { memberRepository, permissions: new ThemePermissionService(membershipAccess, new ThemePermissionPolicy()) };
  }
}
