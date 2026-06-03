import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { OrganizationMembershipPolicy } from '../../../../domain/organization/services/organization-membership-policy';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';
import { RemoveMemberFromOrganizationUseCase } from './remove-member-from-organization-use-case';

const membershipPolicy = new OrganizationMembershipPolicy();
const organizationId = backendTestIdentifiers.organization(1);
const memberId = backendTestIdentifiers.organizationMember(1);
const requesterUserId = backendTestIdentifiers.user(10);

describe('RemoveMemberFromOrganizationUseCase', () => {
  it('throws MEMBER_NOT_FOUND when member does not exist', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({ findById: null });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new RemoveMemberFromOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );
    await expect(useCase.execute(memberId, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.MEMBER_NOT_FOUND,
    );
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
    const useCase = new RemoveMemberFromOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );
    await expect(useCase.execute(memberId, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when trying to remove the last owner', async () => {
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
    const useCase = new RemoveMemberFromOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );
    await expect(useCase.execute(memberId, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER,
    );
  });

  it('throws when a manager tries to remove an owner', async () => {
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
        isOwner: () => false,
      } as never,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new RemoveMemberFromOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(useCase.execute(memberId, requesterUserId)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('deletes member when allowed', async () => {
    const memberToRemove = {
      id: memberId,
      organizationId,
      role: OrganizationRole.MEMBER,
      isOwner: () => false,
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: memberToRemove as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => false,
      } as never,
      delete: undefined,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      createOrganizationRepositoryMock() as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new RemoveMemberFromOrganizationUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );
    await useCase.execute(memberId, requesterUserId);
    expect(memberRepository.delete).toHaveBeenCalledWith(memberId);
  });
});
