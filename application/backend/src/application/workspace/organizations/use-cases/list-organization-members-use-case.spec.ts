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
import { ListOrganizationMembersUseCase } from './list-organization-members-use-case';

const organizationIdentifier = new OrganizationIdentifier();
const membershipPolicy = new OrganizationMembershipPolicy();

describe('ListOrganizationMembersUseCase', () => {
  it('throws when organization does not exist', async () => {
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new ListOrganizationMembersUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(organizationIdentifier.parse(1), backendTestIdentifiers.user(10)),
    ).rejects.toThrow(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
  });

  it('throws when requesting user is not a member', async () => {
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: organizationIdentifier.parse(1) } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new ListOrganizationMembersUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    await expect(
      useCase.execute(organizationIdentifier.parse(1), backendTestIdentifiers.user(10)),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('returns organization members when requester belongs to the organization', async () => {
    const organizationId = organizationIdentifier.parse(1);
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: organizationId } as never,
    });
    const members = [
      {
        id: 4,
        organizationId,
        role: OrganizationRole.OWNER,
        userId: backendTestIdentifiers.user(10),
      },
      {
        id: 5,
        organizationId,
        role: OrganizationRole.MEMBER,
        userId: backendTestIdentifiers.user(11),
      },
    ] as never;
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: { id: 4 } as never,
      findByOrganization: members,
    });
    const organizationMembershipAccess = new OrganizationMembershipAccessService(
      organizationRepository as never,
      memberRepository as never,
      membershipPolicy,
    );
    const useCase = new ListOrganizationMembersUseCase(
      organizationMembershipAccess,
      memberRepository as never,
    );

    const result = await useCase.execute(organizationId, backendTestIdentifiers.user(10));

    expect(memberRepository.findByOrganization).toHaveBeenCalledWith(organizationId);
    expect(result).toEqual(members);
  });
});
