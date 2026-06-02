import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { OrganizationMembershipPolicy } from '../../../../domain/organization/services/organization-membership-policy';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';
import { RemoveMemberFromOrganizationUseCase } from './remove-member-from-organization-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const membershipPolicy = new OrganizationMembershipPolicy();

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
    await expect(
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.MEMBER_NOT_FOUND);
  });

  it('throws when requesting user lacks management privileges', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: backendTestIdentifiers.organizationMember(1),
        organizationId: organizationIdentifier.parse(1),
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
    await expect(
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('throws when trying to remove the last owner', async () => {
    const ownerMember = {
      id: backendTestIdentifiers.organizationMember(1),
      organizationId: organizationIdentifier.parse(1),
      role: OrganizationRole.OWNER,
      isOwner: () => true,
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: ownerMember as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => true,
      } as never,
      findByOrganization: [ownerMember] as never,
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
    await expect(
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER);
  });

  it('throws when a manager tries to remove an owner', async () => {
    const ownerMember = {
      id: backendTestIdentifiers.organizationMember(1),
      organizationId: organizationIdentifier.parse(1),
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

    await expect(
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('deletes member when allowed', async () => {
    const memberToRemove = {
      id: backendTestIdentifiers.organizationMember(1),
      organizationId: organizationIdentifier.parse(1),
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
    await useCase.execute(
      backendTestIdentifiers.organizationMember(1),
      backendTestIdentifiers.user(10),
    );
    expect(memberRepository.delete).toHaveBeenCalledWith(
      backendTestIdentifiers.organizationMember(1),
    );
  });
});
