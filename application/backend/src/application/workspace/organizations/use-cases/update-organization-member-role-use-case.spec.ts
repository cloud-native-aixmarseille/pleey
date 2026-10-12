import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { OrganizationMembershipPolicy } from '../../../../domain/organization/services/organization-membership-policy';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createOrganizationMemberFixture } from '../../../../test-utils/fixtures/unit/organization-member.fixture';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';
import { UpdateOrganizationMemberRoleUseCase } from './update-organization-member-role-use-case';

const membershipPolicy = new OrganizationMembershipPolicy();
const organizationId = backendTestIdentifiers.organization(1);
const memberId = backendTestIdentifiers.organizationMember(1);
const requesterUserId = backendTestIdentifiers.user(10);

describe('UpdateOrganizationMemberRoleUseCase', () => {
  it('throws MEMBER_NOT_FOUND when member does not exist', async () => {
    // Arrange
    const memberRepository = createOrganizationMemberRepositoryMock({ findById: null });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act + Assert
    await expect(useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.MEMBER_NOT_FOUND,
    );
  });

  it('throws when requesting user lacks management privileges', async () => {
    // Arrange
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: createOrganizationMemberFixture({
        id: memberId,
        organizationId,
        role: OrganizationRole.MEMBER,
      }) as never,
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.MEMBER }) as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act + Assert
    await expect(useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when trying to demote the last owner', async () => {
    // Arrange
    const ownerMember = createOrganizationMemberFixture({ id: memberId, organizationId, role: OrganizationRole.OWNER });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: ownerMember as never,
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.OWNER }) as never,
      countOwnersByOrganization: 1,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act + Assert
    await expect(useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER,
    );
  });

  it('throws when a manager tries to promote a member to owner', async () => {
    // Arrange
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: createOrganizationMemberFixture({
        id: memberId,
        organizationId,
        role: OrganizationRole.MEMBER,
      }) as never,
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.MANAGER }) as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act + Assert
    await expect(useCase.execute(memberId, OrganizationRole.OWNER, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when a manager tries to edit an owner', async () => {
    // Arrange
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: createOrganizationMemberFixture({
        id: memberId,
        organizationId,
        role: OrganizationRole.OWNER,
      }) as never,
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.MANAGER }) as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act + Assert
    await expect(useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('returns the current member when role is unchanged', async () => {
    // Arrange
    const member = createOrganizationMemberFixture({
      id: memberId,
      organizationId,
      role: OrganizationRole.MANAGER,
      username: 'captain',
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: member as never,
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.OWNER }) as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act + Assert
    await expect(useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId)).resolves.toBe(member);
    expect(memberRepository.updateRole).not.toHaveBeenCalled();
  });

  it('updates the role when allowed', async () => {
    // Arrange
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: createOrganizationMemberFixture({
        id: memberId,
        organizationId,
        role: OrganizationRole.MEMBER,
      }) as never,
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.OWNER }) as never,
      updateRole: createOrganizationMemberFixture({
        id: memberId,
        organizationId,
        role: OrganizationRole.MANAGER,
      }),
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(organizationMembershipAccess, memberRepository as never);

    // Act
    await useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId);

    // Assert
    expect(memberRepository.updateRole).toHaveBeenCalledWith(memberId, OrganizationRole.MANAGER);
  });
});
