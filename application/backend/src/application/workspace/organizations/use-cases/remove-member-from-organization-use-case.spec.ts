import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { createOrganizationMemberRepositoryMock } from '../../../../test-utils/mock-factories/organization.mock-factory';
import { OrganizationIdentifier } from '../../shared/services/identifiers/organization-identifier';
import { RemoveMemberFromOrganizationUseCase } from './remove-member-from-organization-use-case';

const organizationIdentifier = new OrganizationIdentifier();

describe('RemoveMemberFromOrganizationUseCase', () => {
  it('throws MEMBER_NOT_FOUND when member does not exist', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({ findById: null });
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.MEMBER_NOT_FOUND);
  });

  it('throws when requesting user lacks management privileges', async () => {
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: {
        id: 1,
        organizationId: organizationIdentifier.parse(1),
        role: OrganizationRole.MEMBER,
      } as never,
      findByOrganizationAndUser: { hasManagementPrivileges: () => false } as never,
    });
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await expect(useCase.execute(1, 10)).rejects.toThrow(
      OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('throws when trying to remove the last owner', async () => {
    const ownerMember = {
      id: 1,
      organizationId: organizationIdentifier.parse(1),
      role: OrganizationRole.OWNER,
      isOwner: () => true,
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: ownerMember as never,
      findByOrganizationAndUser: { hasManagementPrivileges: () => true } as never,
      findByOrganization: [ownerMember] as never,
    });
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await expect(useCase.execute(1, 10)).rejects.toThrow(
      OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER,
    );
  });

  it('deletes member when allowed', async () => {
    const memberToRemove = {
      id: 1,
      organizationId: organizationIdentifier.parse(1),
      role: OrganizationRole.MEMBER,
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findById: memberToRemove as never,
      findByOrganizationAndUser: { hasManagementPrivileges: () => true } as never,
      delete: undefined,
    });
    const useCase = new RemoveMemberFromOrganizationUseCase(memberRepository as never);
    await useCase.execute(1, 10);
    expect(memberRepository.delete).toHaveBeenCalledWith(1);
  });
});
