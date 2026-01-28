import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { createGameRepositoryMock } from '../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
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
    const gameRepository = createGameRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock();

    const useCase = new GetOrganizationDashboardUseCase(
      defaultWorkspaceService as never,
      organizationRepository as never,
      memberRepository as never,
      gameRepository as never,
      projectRepository as never,
      sessionRepository as never,
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
    const gameRepository = createGameRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock();

    const useCase = new GetOrganizationDashboardUseCase(
      defaultWorkspaceService as never,
      organizationRepository as never,
      memberRepository as never,
      gameRepository as never,
      projectRepository as never,
      sessionRepository as never,
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

    const gameRepository = createGameRepositoryMock({
      findByProject: [{ id: 11 }, { id: 22 }] as never,
    });

    const sessionRepository = createGameSessionRepositoryMock({
      findByGameId: [
        { status: GameSessionStatus.WAITING },
        { status: GameSessionStatus.ENDED },
      ] as never,
    });

    const useCase = new GetOrganizationDashboardUseCase(
      defaultWorkspaceService as never,
      organizationRepository as never,
      memberRepository as never,
      gameRepository as never,
      projectRepository as never,
      sessionRepository as never,
    );

    const result = await useCase.execute(1, 10);
    expect(result.stats).toEqual({
      totalGames: 4,
      totalGameSessions: 8,
      activeGameSessions: 4,
      totalMembers: 2,
      totalProjects: 2,
    });
  });
});
