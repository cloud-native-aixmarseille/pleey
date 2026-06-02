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
import { UpdateOrganizationMemberRoleUseCase } from './update-organization-member-role-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const membershipPolicy = new OrganizationMembershipPolicy();

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
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        OrganizationRole.MANAGER,
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
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        OrganizationRole.MANAGER,
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('throws when trying to demote the last owner', async () => {
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
    const useCase = new UpdateOrganizationMemberRoleUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        OrganizationRole.MANAGER,
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER);
  });

  it('throws when a manager tries to promote a member to owner', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: backendTestIdentifiers.organizationMember(1),
        organizationId: organizationIdentifier.parse(1),
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
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        OrganizationRole.OWNER,
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('throws when a manager tries to edit an owner', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: backendTestIdentifiers.organizationMember(1),
        organizationId: organizationIdentifier.parse(1),
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
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        OrganizationRole.MANAGER,
        backendTestIdentifiers.user(10),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('returns the current member when role is unchanged', async () => {
    const member = {
      id: backendTestIdentifiers.organizationMember(1),
      organizationId: organizationIdentifier.parse(1),
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
      useCase.execute(
        backendTestIdentifiers.organizationMember(1),
        OrganizationRole.MANAGER,
        backendTestIdentifiers.user(10),
      ),
    ).resolves.toBe(member);
    expect(memberRepository.updateRole).not.toHaveBeenCalled();
  });

  it('updates the role when allowed', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: backendTestIdentifiers.organizationMember(1),
        organizationId: organizationIdentifier.parse(1),
        role: OrganizationRole.MEMBER,
        isOwner: () => false,
      } as never,
      findByOrganizationAndUser: {
        hasManagementPrivileges: () => true,
        isOwner: () => true,
      } as never,
      updateRole: {
        id: backendTestIdentifiers.organizationMember(1),
        organizationId: organizationIdentifier.parse(1),
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

    await useCase.execute(
      backendTestIdentifiers.organizationMember(1),
      OrganizationRole.MANAGER,
      backendTestIdentifiers.user(10),
    );

    expect(memberRepository.updateRole).toHaveBeenCalledWith(
      backendTestIdentifiers.organizationMember(1),
      OrganizationRole.MANAGER,
    );
  });
});
