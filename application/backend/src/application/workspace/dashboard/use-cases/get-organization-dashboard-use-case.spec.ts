import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import {
  createOrganizationMemberRepositoryMock,
  createOrganizationRepositoryMock,
} from '../../../../test-utils/mock-factories/organization.mock-factory';
import { createProjectRepositoryMock } from '../../../../test-utils/mock-factories/project-repository.mock-factory';
import { GetOrganizationDashboardUseCase } from './get-organization-dashboard-use-case';

describe('GetOrganizationDashboardUseCase', () => {
  it('throws when organization does not exist', async () => {
    const defaultWorkspaceService = {
      ensure: vi.fn().mockResolvedValue(undefined),
    };
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

    await expect(useCase.execute(1, 10)).rejects.toThrow(
      OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
    );
    expect(defaultWorkspaceService.ensure).toHaveBeenCalledWith(10);
  });

  it('throws when user is not a member', async () => {
    const defaultWorkspaceService = {
      ensure: vi.fn().mockResolvedValue(undefined),
    };
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1, name: 'Org', description: null } as never,
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

    await expect(useCase.execute(1, 10)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('returns aggregated stats', async () => {
    const defaultWorkspaceService = {
      ensure: vi.fn().mockResolvedValue(undefined),
    };
    const organizationRepository = createOrganizationRepositoryMock({
      findById: { id: 1, name: 'Org', description: null } as never,
    });
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: {} as never,
      findByOrganization: [{ id: 1 }, { id: 2 }] as never,
    });

    const projectRepository = createProjectRepositoryMock({
      findByOrganization: [{ id: 1 }, { id: 2 }] as never,
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

    const result = await useCase.execute(1, 10);
    expect(result.stats).toEqual({
      totalGames: 4,
      totalParties: 8,
      activeParties: 4,
      totalMembers: 2,
      totalProjects: 2,
    });
  });
});
