import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { createDefaultWorkspaceServiceMock } from '../../../../test-utils/mock-factories/default-workspace-service.mock-factory';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { GetOrganizationDashboardUseCase } from './get-organization-dashboard-use-case';

describe('GetOrganizationDashboardUseCase', () => {
  it('throws when organization does not exist', async () => {
    const defaultWorkspaceService = createDefaultWorkspaceServiceMock();
    const organizationRepository = createOrganizationRepositoryMock({ findById: null });
    const memberRepository = createOrganizationMemberRepositoryMock();
    const projectRepository = createProjectRepositoryMock();
    const workspaceGameManagement = {
      getOrganizationDashboardStats: vi.fn(),
    };

    const useCase = new GetOrganizationDashboardUseCase(
      defaultWorkspaceService as never,
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
      workspaceGameManagement as never,
    );

    await expect(
      useCase.execute(backendTestIdentifiers.organization(1), backendTestIdentifiers.user(10)),
    ).rejects.toThrow(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    expect(defaultWorkspaceService.ensure).toHaveBeenCalledWith(backendTestIdentifiers.user(10));
  });

  it('throws when user is not a member', async () => {
    const defaultWorkspaceService = createDefaultWorkspaceServiceMock();
    const organizationRepository = createOrganizationRepositoryMock({
      findById: {
        id: backendTestIdentifiers.organization(1),
        name: 'Org',
        description: null,
      } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: null,
    });
    const projectRepository = createProjectRepositoryMock();
    const workspaceGameManagement = {
      getOrganizationDashboardStats: vi.fn(),
    };

    const useCase = new GetOrganizationDashboardUseCase(
      defaultWorkspaceService as never,
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
      workspaceGameManagement as never,
    );

    await expect(
      useCase.execute(backendTestIdentifiers.organization(1), backendTestIdentifiers.user(10)),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('returns aggregated stats', async () => {
    const defaultWorkspaceService = createDefaultWorkspaceServiceMock();
    const organizationRepository = createOrganizationRepositoryMock({
      findById: {
        id: backendTestIdentifiers.organization(1),
        name: 'Org',
        description: null,
      } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
      findByOrganization: [
        { id: backendTestIdentifiers.organizationMember(1) },
        { id: backendTestIdentifiers.organizationMember(2) },
      ] as never,
    });

    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [
        { id: backendTestIdentifiers.project(1) },
        { id: backendTestIdentifiers.project(2) },
      ] as never,
    });

    const workspaceGameManagement = {
      getOrganizationDashboardStats: vi.fn().mockResolvedValue({
        totalGames: 4,
        totalParties: 8,
        activeParties: 4,
      }),
    };

    const useCase = new GetOrganizationDashboardUseCase(
      defaultWorkspaceService as never,
      organizationRepository as never,
      memberRepository as never,
      projectRepository as never,
      workspaceGameManagement as never,
    );

    const result = await useCase.execute(
      backendTestIdentifiers.organization(1),
      backendTestIdentifiers.user(10),
    );
    expect(result.stats).toEqual({
      totalGames: 4,
      totalParties: 8,
      activeParties: 4,
      totalMembers: 2,
      totalProjects: 2,
    });
  });
});
