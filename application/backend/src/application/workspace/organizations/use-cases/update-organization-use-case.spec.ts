import { DEFAULT_PARTY_SETTINGS } from '../../../../domain/game/party/shared/entities/party-settings';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createOrganizationMemberFixture } from '../../../../test-utils/fixtures/unit/organization-member.fixture';
import { createWorkspacePermissionServices } from '../../../../test-utils/fixtures/workspace-permission-fixture-factory';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { ThemeSelectionServiceMockFactory } from '../../../../test-utils/mock-factories/theme-selection-service-mock-factory';
import type { UpdateOrganizationDto } from '../dto/update-organization-dto';
import { UpdateOrganizationUseCase } from './update-organization-use-case';

describe('UpdateOrganizationUseCase', () => {
  it('throws when the organization does not exist', async () => {
    // Arrange
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const useCase = new UpdateOrganizationUseCase(
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
      organizationRepository as never,
      new ThemeSelectionServiceMockFactory().create(),
    );

    // Act + Assert
    await expect(
      useCase.execute(
        backendTestIdentifiers.organization(1),
        { name: 'Org', description: '', defaultThemeId: 'solar-grid' } satisfies UpdateOrganizationDto,
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
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.MEMBER }) as never,
    });
    const useCase = new UpdateOrganizationUseCase(
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
      organizationRepository as never,
      new ThemeSelectionServiceMockFactory().create(),
    );

    // Act + Assert
    await expect(
      useCase.execute(
        backendTestIdentifiers.organization(1),
        { name: 'Org', description: '', defaultThemeId: 'solar-grid' } satisfies UpdateOrganizationDto,
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
      findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.MANAGER }) as never,
    });
    const useCase = new UpdateOrganizationUseCase(
      createWorkspacePermissionServices(memberRepository as never, organizationRepository as never).membershipAccess,
      organizationRepository as never,
      new ThemeSelectionServiceMockFactory().create(),
    );

    const dto: UpdateOrganizationDto = {
      name: 'Updated Org',
      description: 'Updated description',
      defaultPartySettings: {
        ...DEFAULT_PARTY_SETTINGS,
        allowOptionChangeAfterVoting: true,
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
  it.each([
    { selection: undefined, expected: undefined },
    { selection: null, expected: null },
    { selection: 'solar-grid', expected: 'solar-grid' },
  ] as const)(
    'updates theme selection $selection without conflating omission and inheritance',
    async ({ selection, expected }) => {
      // Arrange
      const repository = createOrganizationRepositoryMock({
        findById: {
          id: backendTestIdentifiers.organization(1),
          organizationId: backendTestIdentifiers.organization(3),
          defaultThemeId: 'cyber-arcade',
        } as never,
        findByName: null,
        update: { id: backendTestIdentifiers.organization(1) } as never,
      });
      const members = createOrganizationMemberRepositoryMock({
        findByOrganizationAndUser: createOrganizationMemberFixture({ role: OrganizationRole.MANAGER }) as never,
      });
      const useCase = new UpdateOrganizationUseCase(
        createWorkspacePermissionServices(members as never, repository as never).membershipAccess,
        repository as never,
        new ThemeSelectionServiceMockFactory().create(),
      );

      // Act
      await useCase.execute(
        backendTestIdentifiers.organization(1),
        { name: 'Brand', defaultThemeId: selection },
        backendTestIdentifiers.user(1),
      );

      // Assert
      expect(repository.update).toHaveBeenCalledWith(
        backendTestIdentifiers.organization(1),
        'Brand',
        null,
        expect.objectContaining({ defaultThemeId: expected }),
      );
    },
  );
});
