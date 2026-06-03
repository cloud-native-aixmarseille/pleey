import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { OrganizationMembershipPolicy } from '../../../../domain/organization/services/organization-membership-policy';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
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
    const memberRepository = createOrganizationMemberRepositoryMock({ findById: null });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId),
    ).rejects.toThrow(OrganizationErrorCode.MEMBER_NOT_FOUND);
  });

  it('throws when requesting user lacks management privileges', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: memberId,
        organizationId,
        role: OrganizationRole.MEMBER,
        isOwner: () => false,
      } as never,
      findByOrganizationAndUser: { hasManagementPrivileges: () => false } as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('throws when trying to demote the last owner', async () => {
    const ownerMember = {
      id: memberId,
      organizationId,
      role: OrganizationRole.OWNER,
      isOwner: () => true,
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: ownerMember as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => true,
      } as never,
      countOwnersByOrganization: 1,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId),
    ).rejects.toThrow(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER);
  });

  it('throws when a manager tries to promote a member to owner', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: memberId,
        organizationId,
        role: OrganizationRole.MEMBER,
        isOwner: () => false,
      } as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => false,
      } as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(memberId, OrganizationRole.OWNER, requesterUserId),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('throws when a manager tries to edit an owner', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: memberId,
        organizationId,
        role: OrganizationRole.OWNER,
        isOwner: () => true,
      } as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => false,
      } as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('returns the current member when role is unchanged', async () => {
    const member = {
      id: memberId,
      organizationId,
      role: OrganizationRole.MANAGER,
      isOwner: () => false,
      username: 'captain',
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: member as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => true,
      } as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId),
    ).resolves.toBe(member);
    expect(memberRepository.updateRole).not.toHaveBeenCalled();
  });

  it('updates the role when allowed', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: memberId,
        organizationId,
        role: OrganizationRole.MEMBER,
        isOwner: () => false,
      } as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => true,
      } as never,
      updateRole: {
        id: memberId,
        organizationId,
        role: OrganizationRole.MANAGER,
      } as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await useCase.execute(memberId, OrganizationRole.MANAGER, requesterUserId);

    expect(memberRepository.updateRole).toHaveBeenCalledWith(memberId, OrganizationRole.MANAGER);
  });
});
