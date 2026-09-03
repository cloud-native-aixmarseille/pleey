import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import type { UpdateOrganizationDto } from '../dto/update-organization-dto';
import { UpdateOrganizationUseCase } from './update-organization-use-case';

describe('UpdateOrganizationUseCase', () => {
  it('throws when the organization does not exist', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const useCase = new UpdateOrganizationUseCase(organizationRepository as never, memberRepository as never);

    // Act + Assert
    await expect(
      useCase.execute(
        backendTestIdentifiers.organization(1),
        { name: 'Org', description: '' } satisfies UpdateOrganizationDto,
        backendTestIdentifiers.user(1),
      ),
    ).rejects.toThrow(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
  });

  it('throws when the requester lacks management privileges', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: backendTestIdentifiers.organization(1), name: 'Org' } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        role: OrganizationRole.MEMBER,
        hasManagementPrivileges: () => false,
      } as never,
    });
    const useCase = new UpdateOrganizationUseCase(organizationRepository as never, memberRepository as never);

    // Act + Assert
    await expect(
      useCase.execute(
        backendTestIdentifiers.organization(1),
        { name: 'Org', description: '' } satisfies UpdateOrganizationDto,
        backendTestIdentifiers.user(1),
      ),
    ).rejects.toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('updates the organization defaults for a manager', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: backendTestIdentifiers.organization(1), name: 'Org' } as never,
      findByName: { id: backendTestIdentifiers.organization(1), name: 'Org' } as never,
      update: { id: backendTestIdentifiers.organization(1), name: 'Updated Org' } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {
        role: OrganizationRole.MANAGER,
        hasManagementPrivileges: () => true,
      } as never,
    });
    const useCase = new UpdateOrganizationUseCase(organizationRepository as never, memberRepository as never);

    const dto: UpdateOrganizationDto = {
      name: 'Updated Org',
      description: 'Updated description',
      defaultPartySettings: {
        allowJoiningAfterStart: false,
        allowOptionChangeAfterVoting: true,
        randomizeOptionOrder: false,
        randomizeStageOrder: true,
      },
    };

    // Act
    const organization = await useCase.execute(
      backendTestIdentifiers.organization(1),
      dto,
      backendTestIdentifiers.user(1),
    );

    // Assert
    expect(organizationRepository.update).toHaveBeenCalledWith(
      backendTestIdentifiers.organization(1),
      'Updated Org',
      'Updated description',
      {
        defaultPartySettings: dto.defaultPartySettings,
      },
    );
    expect(organization).toMatchObject({ id: backendTestIdentifiers.organization(1), name: 'Updated Org' });
  });
});
